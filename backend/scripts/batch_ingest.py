#!/usr/bin/env python3
"""
Batch ingest all books into ChromaDB with resume capability.

Usage:
    python scripts/batch_ingest.py                          # all books
    python scripts/batch_ingest.py --book-ids 1 5 10         # specific books
    python scripts/batch_ingest.py --start-from 10           # resume from book ID 10
    python scripts/batch_ingest.py --force                   # rebuild all
    python scripts/batch_ingest.py --dry-run                 # show what would be processed

Progress is saved to progress.json so you can resume after interruption.
"""

import sys
import json
import asyncio
import structlog
import time
from pathlib import Path
from typing import Optional

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

PROGRESS_FILE = Path(__file__).parent / ".ingest_progress.json"


def load_progress() -> dict:
    """Load progress from JSON file."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"completed": [], "failed": [], "started_at": None, "updated_at": None}


def save_progress(progress: dict):
    """Save progress to JSON file."""
    progress["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2, ensure_ascii=False), encoding="utf-8")


def print_summary(results: dict):
    """Print final summary."""
    print()
    print("=" * 72)
    print("  BATCH INGESTION RESULTS")
    print("=" * 72)
    print(f"  Total books: {results['total']}")
    print(f"  Success: {len(results['success'])}")
    print(f"  Failed: {len(results['failed'])}")
    print(f"  Skipped: {len(results['skipped'])}")
    print(f"  Total time: {results.get('elapsed_minutes', 0):.1f} min")

    if results["failed"]:
        print(f"\n  FAILED BOOKS:")
        for b in results["failed"]:
            print(f"    ID {b['id']:>3}  {b['title'][:55]}")
            print(f"         Reason: {b['error'][:100]}")

    if results["success"]:
        print(f"\n  SUCCESSFULLY INGESTED:")
        for b in results["success"]:
            print(f"    ID {b['id']:>3}  {b['title'][:60]}")

    print()
    print(f"  Progress file: {PROGRESS_FILE}")
    print("=" * 72)
    print()


async def main():
    import argparse
    parser = argparse.ArgumentParser(description="Batch ingest books into ChromaDB")
    parser.add_argument("--book-ids", nargs="+", type=int, help="Specific book IDs (default: all)")
    parser.add_argument("--start-from", type=int, help="Resume from a specific book ID")
    parser.add_argument("--force", action="store_true", help="Rebuild all, even if they exist")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be processed without doing it")
    parser.add_argument("--reset-progress", action="store_true", help="Clear progress file and start fresh")
    args = parser.parse_args()

    # ── Progress file management ──
    if args.reset_progress and PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()
        print("Progress file reset.")

    progress = load_progress()
    start_time = time.time()
    if not progress.get("started_at"):
        progress["started_at"] = time.strftime("%Y-%m-%d %H:%M:%S")

    # ── Select books ──
    if args.book_ids:
        books = [b for b in BOOKS_DATA if b["id"] in args.book_ids]
    else:
        books = list(BOOKS_DATA)

    # Filter by start_from
    if args.start_from:
        books = [b for b in books if b["id"] >= args.start_from]

    if not books:
        print("No books to process.")
        return

    print(f"\n  Books to process: {len(books)}")

    # ── Dry run ──
    if args.dry_run:
        print("\n  DRY RUN — would process these books:")
        for book in books:
            book_id = book["id"]
            already_done = book_id in progress.get("completed", [])
            label = "DONE" if already_done else "PENDING"
            print(f"  [{label}] ID {book_id:>3}  {book['title'][:60]}")
        return

    # ── Initialise ──
    VectorDBConfig.validate()
    processor = PDFProcessor()
    chunker = TextChunker()
    embedder = EmbeddingService()
    store = VectorStore()

    results = {
        "total": len(books),
        "success": [],
        "failed": [],
        "skipped": [],
    }

    # Ensure completed/failed in progress are sets for fast lookup
    progress.setdefault("completed", [])
    progress.setdefault("failed", [])
    already_completed = set(progress["completed"])
    already_failed = set(progress["failed"])

    # ── Process each book ──
    for i, book in enumerate(books, 1):
        book_id = book["id"]
        title = book["title"]
        pdf_url = book.get("pdfUrl", "")

        # Skip if already successfully processed
        if book_id in already_completed and not args.force:
            print(f"  [{i}/{len(books)}] SKIP  ID {book_id:>3}  {title[:55]}")
            results["skipped"].append({"id": book_id, "title": title})
            continue

        print(f"\n  [{i}/{len(books)}] BEGIN ID {book_id:>3}  {title[:55]}")
        book_start = time.time()

        try:
            # ── Check existing ──
            if not args.force:
                try:
                    stats = store.get_collection_stats(book_id)
                    if stats.get("count", 0) > 0:
                        print(f"         Already in ChromaDB ({stats['count']} chunks). Skipping.")
                        results["skipped"].append({"id": book_id, "title": title})
                        progress["completed"].append(book_id)
                        if book_id in already_failed:
                            already_failed.discard(book_id)
                            progress["failed"] = [f for f in progress["failed"] if f != book_id]
                        save_progress(progress)
                        continue
                except Exception:
                    pass

            # ── Download PDF ──
            if not pdf_url:
                print(f"         NO PDF URL")
                raise ValueError("No PDF URL")

            pdf_path = await processor.download_pdf(pdf_url, book_id)
            size_mb = pdf_path.stat().st_size / (1024 * 1024)
            print(f"         PDF: {size_mb:.1f} MB")

            # ── Extract text ──
            analysis = processor.analyse_pdf(pdf_path)
            print(f"         Pages: {analysis['total_pages']} (embedded: {analysis['pages_with_embedded_text']}, scanned: {analysis['total_pages'] - analysis['pages_with_embedded_text']})")

            text = processor.extract_text(pdf_path)
            if not text or not text.strip():
                raise ValueError("No text extracted")

            char_count = len(text)
            print(f"         Text: {char_count:,} chars, ~{char_count // 5:,} words")

            # ── Chunk ──
            chunks = chunker.chunk_text(text, book_id, title)
            if not chunks:
                raise ValueError("No chunks created")
            print(f"         Chunks: {len(chunks)}")

            # ── Embed ──
            chunk_texts = [chunk["text"] for chunk in chunks]
            embeddings = embedder.embed_texts(chunk_texts)
            print(f"         Embeddings: {len(embeddings)} ({embedder.get_dimension()}-dim)")

            # ── Upload ──
            if args.force:
                try:
                    store.delete_book(book_id)
                except Exception:
                    pass
            store.add_documents(book_id, chunks, embeddings)

            # ── Verify ──
            stats = store.get_collection_stats(book_id)
            print(f"         VERIFIED: {stats.get('count', '?')} chunks stored")

            elapsed = time.time() - book_start
            results["success"].append({"id": book_id, "title": title, "elapsed_sec": round(elapsed, 1)})
            progress["completed"].append(book_id)
            if book_id in already_failed:
                already_failed.discard(book_id)
                progress["failed"] = [f for f in progress["failed"] if f != book_id]
            save_progress(progress)
            print(f"         DONE ({elapsed:.1f}s)")

        except Exception as e:
            elapsed = time.time() - book_start
            error_msg = str(e)[:200]
            print(f"         FAILED ({elapsed:.1f}s): {error_msg}")
            results["failed"].append({"id": book_id, "title": title, "error": error_msg})
            if book_id not in already_failed:
                progress["failed"].append(book_id)
            save_progress(progress)

    # ── Cleanup ──
    if not args.force:
        processor.cleanup()

    # ── Summary ──
    results["elapsed_minutes"] = (time.time() - start_time) / 60
    print_summary(results)

    # Save final results
    progress["finished_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    save_progress(progress)

    sys.exit(0 if not results["failed"] else 1)


if __name__ == "__main__":
    asyncio.run(main())
