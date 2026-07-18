#!/usr/bin/env python3
"""
Ingest a single book into ChromaDB with preview and confirmation.

Usage:
    python scripts/ingest_book.py --book-id 1
    python scripts/ingest_book.py --book-id 1 --force
    python scripts/ingest_book.py --book-id 1 --no-confirm  # skip confirmation prompt
    python scripts/ingest_book.py --book-id 1 --skip-download  # use existing PDF
"""

import sys
import asyncio
import structlog
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from data.books import BOOKS_DATA
from services.vector_db.config import VectorDBConfig
from services.vector_db.pdf_processor import PDFProcessor
from services.vector_db.chunker import TextChunker
from services.vector_db.embedder import EmbeddingService
from services.vector_db.vector_store import VectorStore

logger = structlog.get_logger()
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)


def print_book_info(book: dict):
    """Print book details."""
    print()
    print("=" * 72)
    print(f"  BOOK: {book['title']}")
    print(f"  Author: {book['author']}")
    print(f"  Category: {book['category']}")
    print(f"  PDF: {book.get('pdfUrl', 'N/A')}")
    print(f"  ID: {book['id']}")
    print("=" * 72)
    print()


async def ingest_book(args) -> bool:
    """Ingest a single book."""
    book = next((b for b in BOOKS_DATA if b["id"] == args.book_id), None)
    if not book:
        print(f"ERROR: Book with ID {args.book_id} not found in books.py")
        return False

    book_id = book["id"]
    title = book["title"]
    pdf_url = book.get("pdfUrl", "")

    print_book_info(book)

    if not pdf_url:
        print("ERROR: No PDF URL for this book")
        return False

    # ── Check existing state ──
    store = VectorStore()
    existing_chunks = 0
    try:
        stats = store.get_collection_stats(book_id)
        if stats.get("count", 0) > 0:
            existing_chunks = stats["count"]
            print(f"  Collection already exists with {existing_chunks} chunks.")
            if not args.force:
                print("  Use --force to rebuild.")
                return False
            print("  --force set. Will delete and rebuild.")
    except Exception:
        pass

    # ── Download PDF ──
    processor = PDFProcessor()

    if not args.skip_download:
        print("  Downloading PDF...")
        try:
            pdf_path = await processor.download_pdf(pdf_url, book_id)
            print(f"  PDF saved to: {pdf_path}")
        except Exception as e:
            print(f"ERROR: Failed to download PDF: {e}")
            return False
    else:
        pdf_path = processor.download_dir / f"book_{book_id}.pdf"
        if not pdf_path.exists():
            print(f"ERROR: PDF not found at {pdf_path} (use --skip-download only if PDF exists)")
            return False
        print(f"  Using existing PDF: {pdf_path}")

    # ── Analyse PDF ──
    print("  Analysing PDF...")
    analysis = processor.analyse_pdf(pdf_path)

    print(f"  Total pages: {analysis['total_pages']}")
    print(f"  Pages with embedded text: {analysis['pages_with_embedded_text']}")
    print(f"  Pages with images only: {analysis['pages_with_images']}")
    print(f"  PDF type: {analysis['pdf_type']}")

    if args.show_pages:
        print("\n  Per-page breakdown:")
        for p in analysis["per_page"]:
            icon = "T" if p["has_embedded_text"] else "O"
            print(f"    Page {p['page']:>4}: [{icon}] chars={p['char_count']:>5} images={p['image_count']}")
        print()

    # ── Extract text ──
    print("  Extracting text...")
    text = processor.extract_text(pdf_path)

    if not text or not text.strip():
        print("ERROR: No text extracted from PDF")
        return False

    char_count = len(text)
    word_count = len(text.split())
    print(f"  Extracted {char_count:,} chars, ~{word_count:,} words")

    # ── Preview ──
    print(f"\n  {'─' * 72}")
    print("  TEXT PREVIEW (first 2000 chars):")
    print(f"  {'─' * 72}")
    print()
    print(text[:2000])
    print()
    if len(text) > 2000:
        print(f"  ... ({len(text) - 2000:,} more chars)")
    print()
    print(f"  {'─' * 72}")
    print()

    # ── Confirmation ──
    if not args.no_confirm:
        confirm = input("  Proceed with chunking and upload? [y/N] ").strip().lower()
        if confirm != "y":
            print("  Aborted.")
            return False

    # ── Delete existing if force ──
    if args.force and existing_chunks > 0:
        print("  Deleting existing collection...")
        store.delete_book(book_id)

    # ── Chunk ──
    print("  Chunking text...")
    chunker = TextChunker()
    chunks = chunker.chunk_text(text, book_id, title)
    print(f"  Created {len(chunks)} chunks")

    if not chunks:
        print("ERROR: No chunks created")
        return False

    # ── Embed ──
    print("  Generating embeddings...")
    embedder = EmbeddingService()
    chunk_texts = [chunk["text"] for chunk in chunks]
    embeddings = embedder.embed_texts(chunk_texts)
    print(f"  Generated {len(embeddings)} embeddings")

    # ── Upload ──
    print("  Uploading to ChromaDB...")
    try:
        store.add_documents(book_id, chunks, embeddings)
    except Exception as e:
        print(f"ERROR: Failed to upload to ChromaDB: {e}")
        return False

    # ── Verify ──
    stats = store.get_collection_stats(book_id)
    print(f"\n  {'=' * 72}")
    print(f"  SUCCESS: {title}")
    print(f"  Chunks stored: {stats.get('count', '?')}")
    print(f"  {'=' * 72}")
    print()

    return True


async def main():
    import argparse
    parser = argparse.ArgumentParser(description="Ingest a single book into ChromaDB")
    parser.add_argument("--book-id", type=int, required=True, help="Book ID to ingest")
    parser.add_argument("--force", action="store_true", help="Rebuild even if collection exists")
    parser.add_argument("--no-confirm", action="store_true", help="Skip confirmation prompt")
    parser.add_argument("--skip-download", action="store_true", help="Use existing PDF (don't download)")
    parser.add_argument("--show-pages", action="store_true", help="Show per-page extraction breakdown")
    args = parser.parse_args()

    success = await ingest_book(args)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())
