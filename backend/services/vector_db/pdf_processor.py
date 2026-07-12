import os
import io
import httpx
import fitz
import structlog
from typing import Optional
from pathlib import Path
from PIL import Image
import numpy as np

from .config import VectorDBConfig

logger = structlog.get_logger()

TESSDATA_DIR = os.path.expanduser("~/tessdata")
os.environ["TESSDATA_PREFIX"] = TESSDATA_DIR

import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


class PDFProcessor:
    """Handles PDF download and text extraction with Tesseract OCR for scanned PDFs."""

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

    def extract_text(self, pdf_path: Path) -> str:
        """Extract text: try embedded first, then Tesseract OCR."""
        logger.info("Checking PDF for text layer", path=str(pdf_path))

        doc = fitz.open(str(pdf_path))
        text_parts = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            if text.strip():
                text_parts.append(text)

        embedded_text = "\n\n".join(text_parts)

        if len(embedded_text) > 100:
            doc.close()
            logger.info(
                "Extracted embedded text",
                path=str(pdf_path),
                characters=len(embedded_text),
            )
            return embedded_text

        logger.info("No embedded text found, using Tesseract OCR", path=str(pdf_path))
        ocr_text = self._extract_with_ocr(doc)
        doc.close()

        return ocr_text

    def _extract_with_ocr(self, doc) -> str:
        """Extract text from scanned PDF using Tesseract OCR. Streams to disk for large PDFs."""
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
                    mat = fitz.Matrix(1.5, 1.5)
                    pix = page.get_pixmap(matrix=mat)
                    img_bytes = pix.tobytes("png")

                    img = Image.open(io.BytesIO(img_bytes))
                    img_np = np.array(img)
                    del img

                    page_text = pytesseract.image_to_string(
                        img_np,
                        lang="urd+eng",
                        config="--psm 3 --oem 1",
                    )
                    del img_np
                    del pix

                    if page_text and page_text.strip():
                        if use_streaming:
                            tmp.write(page_text.strip())
                            tmp.write("\n\n")
                        else:
                            text_parts.append(page_text.strip())
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

            logger.info("OCR extraction complete", characters=len(ocr_text))
            return ocr_text
        except Exception as e:
            if tmp and tmp_path:
                try:
                    tmp.close()
                    os.unlink(tmp_path)
                except Exception:
                    pass
            raise

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
