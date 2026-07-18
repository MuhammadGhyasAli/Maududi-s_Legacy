import os
import io
import httpx
import fitz
import structlog
from typing import Optional, List, Tuple
from pathlib import Path
from PIL import Image
import numpy as np

from .config import VectorDBConfig

logger = structlog.get_logger()

TESSDATA_DIR = os.path.expanduser("~/tessdata")
os.environ["TESSDATA_PREFIX"] = TESSDATA_DIR

import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

_HAS_PADDLE = None


def _get_paddle_ocr():
    """Lazy-load PaddleOCR (downloads models on first call)."""
    global _HAS_PADDLE
    if _HAS_PADDLE is False:
        return None
    if _HAS_PADDLE is None:
        try:
            from paddleocr import PaddleOCR
            ocr = PaddleOCR(use_angle_cls=True, lang='ar', show_log=False)
            _HAS_PADDLE = ocr
            logger.info("PaddleOCR loaded successfully for Urdu/Arabic")
        except ImportError:
            _HAS_PADDLE = False
            logger.warning("PaddleOCR not available")
        except Exception as e:
            _HAS_PADDLE = False
            logger.warning("PaddleOCR failed to load", error=str(e))
    return _HAS_PADDLE if _HAS_PADDLE is not False else None


EMBEDDED_TEXT_THRESHOLD = 50


class PDFProcessor:
    """Handles PDF download and text extraction with per-page detection.

    For each page:
      1. Try embedded text extraction via PyMuPDF
      2. If < threshold chars -> use PaddleOCR (best for Urdu)
      3. If PaddleOCR unavailable/fails -> fall back to Tesseract+urd
    """

    def __init__(self):
        self.config = VectorDBConfig()
        self.download_dir = Path(self.config.PDF_DOWNLOAD_DIR)
        self.download_dir.mkdir(parents=True, exist_ok=True)

    async def download_pdf(self, pdf_url: str, book_id: int) -> Path:
        """Download PDF from URL and save locally."""
        filename = f"book_{book_id}.pdf"
        filepath = self.download_dir / filename

        if filepath.exists():
            logger.info("PDF already downloaded", book_id=book_id, path=str(filepath))
            return filepath

        logger.info("Downloading PDF", book_id=book_id, url=pdf_url)

        async with httpx.AsyncClient(timeout=600.0, follow_redirects=True) as client:
            response = await client.get(pdf_url)
            response.raise_for_status()

            filepath.write_bytes(response.content)
            logger.info(
                "PDF downloaded successfully",
                book_id=book_id,
                size_mb=round(len(response.content) / (1024 * 1024), 2),
            )

        return filepath

    def analyse_pdf(self, pdf_path: Path) -> dict:
        """Analyse PDF and return per-page statistics."""
        doc = fitz.open(str(pdf_path))
        pages_with_text = 0
        pages_with_images = 0
        total_chars = 0
        per_page = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text().strip()
            images = page.get_images(full=True)
            char_count = len(text)
            per_page.append({
                "page": page_num + 1,
                "has_embedded_text": char_count > EMBEDDED_TEXT_THRESHOLD,
                "char_count": char_count,
                "image_count": len(images),
            })
            if char_count > EMBEDDED_TEXT_THRESHOLD:
                pages_with_text += 1
                total_chars += char_count
            if images:
                pages_with_images += 1

        doc.close()

        total_pages = len(doc)
        return {
            "total_pages": total_pages,
            "pages_with_embedded_text": pages_with_text,
            "pages_with_images": pages_with_images,
            "total_chars_embedded": total_chars,
            "per_page": per_page,
            "pdf_type": "embedded" if pages_with_text > total_pages * 0.5 else "scanned",
        }

    def extract_text(self, pdf_path: Path) -> str:
        """Extract text with per-page embedded/OCR detection."""
        logger.info("Extracting text with per-page detection", path=str(pdf_path))

        doc = fitz.open(str(pdf_path))
        total_pages = len(doc)
        all_text: List[str] = []
        ocr_pages = 0
        embedded_pages = 0

        for page_num in range(total_pages):
            page = doc.load_page(page_num)
            text = page.get_text().strip()

            if len(text) > EMBEDDED_TEXT_THRESHOLD:
                all_text.append(text)
                embedded_pages += 1
            else:
                ocr_text = self._ocr_page(page)
                if ocr_text.strip():
                    all_text.append(ocr_text)
                    ocr_pages += 1

            if (page_num + 1) % 20 == 0:
                logger.info(
                    "Extraction progress",
                    page=f"{page_num + 1}/{total_pages}",
                    embedded=embedded_pages,
                    ocr=ocr_pages,
                )

        doc.close()

        result = "\n\n".join(all_text)
        logger.info(
            "Extraction complete",
            total_pages=total_pages,
            embedded_pages=embedded_pages,
            ocr_pages=ocr_pages,
            total_chars=len(result),
        )
        return result

    def _ocr_page(self, page) -> str:
        """OCR a single page: PaddleOCR first, Tesseract fallback."""
        paddle = _get_paddle_ocr()
        if paddle:
            try:
                return self._ocr_page_with_paddle(page, paddle)
            except Exception as e:
                logger.warning("PaddleOCR failed for page, falling back to Tesseract", error=str(e))
        return self._ocr_page_with_tesseract(page)

    def _ocr_page_with_paddle(self, page, paddle) -> str:
        """OCR a page using PaddleOCR with Arabic/Urdu model."""
        mat = fitz.Matrix(2.0, 2.0)
        pix = page.get_pixmap(matrix=mat)
        img_bytes = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_bytes))
        img_np = np.array(img)

        result = paddle.ocr(img_np, cls=True)

        if not result or not result[0]:
            return ""

        lines = {}
        threshold = 10

        for item in result[0]:
            position = item[0]
            text = item[1][0]
            y_center = (position[0][1] + position[2][1]) / 2
            added = False
            for key in list(lines.keys()):
                if abs(y_center - key) < threshold:
                    lines[key].append((position, text))
                    added = True
                    break
            if not added:
                lines[y_center] = [(position, text)]

        sorted_lines = sorted(lines.items(), key=lambda x: x[0])
        page_lines = []
        for y, items in sorted_lines:
            sorted_items = sorted(items, key=lambda x: -max(p[0] for p in x[0]))
            page_lines.append(' '.join(t for _, t in sorted_items))

        return "\n".join(page_lines)

    def _ocr_page_with_tesseract(self, page) -> str:
        """OCR a page using Tesseract with Urdu+English language pack."""
        try:
            mat = fitz.Matrix(1.5, 1.5)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))
            img_np = np.array(img)

            page_text = pytesseract.image_to_string(
                img_np,
                lang="urd+eng",
                config="--psm 3 --oem 1",
            )
            return page_text.strip()
        except Exception as e:
            logger.warning("Tesseract failed for page", error=str(e))
            return ""

    def extract_text_bulk_ocr(self, pdf_path: Path) -> str:
        """Legacy: OCR all pages (used when entire PDF is scanned)."""
        logger.info("Using bulk OCR for scanned PDF", path=str(pdf_path))

        doc = fitz.open(str(pdf_path))
        total_pages = len(doc)
        use_streaming = total_pages > 100
        text_parts = []
        tmp = None
        tmp_path = None

        if use_streaming:
            import tempfile
            tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8')
            tmp_path = tmp.name

        try:
            for page_num in range(total_pages):
                if page_num % 10 == 0:
                    logger.info("OCR progress", page=f"{page_num + 1}/{total_pages}")

                try:
                    page = doc.load_page(page_num)
                    page_text = self._ocr_page(page)
                    if page_text:
                        if use_streaming:
                            tmp.write(page_text)
                            tmp.write("\n\n")
                        else:
                            text_parts.append(page_text)
                except Exception as e:
                    logger.warning("OCR page failed", page=page_num + 1, error=str(e))
                    continue
                finally:
                    try:
                        page.clean_contents()
                    except Exception:
                        pass

            if use_streaming:
                tmp.close()
                with open(tmp_path, 'r', encoding='utf-8') as f:
                    ocr_text = f.read()
                os.unlink(tmp_path)
            else:
                ocr_text = "\n\n".join(text_parts)

            logger.info("Bulk OCR complete", characters=len(ocr_text))
            return ocr_text
        except Exception as e:
            if tmp and tmp_path:
                try:
                    tmp.close()
                    os.unlink(tmp_path)
                except Exception:
                    pass
            raise
        finally:
            doc.close()

    async def process_book(self, book_id: int, pdf_url: str) -> str:
        """Full pipeline: download PDF and extract text."""
        pdf_path = await self.download_pdf(pdf_url, book_id)
        text = self.extract_text(pdf_path)
        return text

    def cleanup(self, book_id: Optional[int] = None):
        """Remove downloaded PDFs."""
        if book_id:
            filepath = self.download_dir / f"book_{book_id}.pdf"
            if filepath.exists():
                filepath.unlink()
        else:
            for f in self.download_dir.glob("*.pdf"):
                f.unlink()
