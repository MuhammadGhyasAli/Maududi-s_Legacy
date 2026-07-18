#!/usr/bin/env python3
"""
Check which books have been ingested into ChromaDB.

Usage:
    python scripts/check_books.py
    python scripts/check_books.py --book-id 5
    python scripts/check_books.py --verbose
"""

import sys
import json
import structlog
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent.parent))

from data.books import BOOKS_DATA
from services.vector_db.vector_store import VectorStore

logger = structlog.get_logger()
structlog.configure(processors=[structlog.processors.JSONRenderer()])


def check_book(store: VectorStore, book: dict, verbose: bool = False) -> dict:
    """Check ingestion status for a single book."""
    book_id = book["id"]
    title = book["title"]
    pdf_url = book.get("pdfUrl", "")
    status = {
        "id": book_id,
        "title": title,
        "has_pdf_url": bool(pdf_url),
        "collection_exists": False,
        "chunk_count": 0,
        "error": None,
    }

    try:
        stats = store.get_collection_stats(book_id)
        if stats.get("error"):
            status["error"] = stats["error"]
        else:
            status["collection_exists"] = True
            status["chunk_count"] = stats.get("count", 0)
    except Exception as e:
        status["error"] = str(e)

    return status


def print_report(results: list[dict], verbose: bool = False):
    """Print a formatted report."""
    ingested = [r for r in results if r["collection_exists"] and r["chunk_count"] > 0]
    partial = [r for r in results if r["collection_exists"] and r["chunk_count"] == 0]
    missing = [r for r in results if not r["collection_exists"]]
    errors = [r for r in results if r["error"] and not r["collection_exists"]]

    print("=" * 72)
    print("  CHROMADB INGESTION STATUS REPORT")
    print("=" * 72)

    print(f"\n  Total books: {len(results)}")
    print(f"  Fully ingested: {len(ingested)}")
    print(f"  Partial (0 chunks): {len(partial)}")
    print(f"  Not ingested: {len(missing)}")
    print(f"  Errors: {len(errors)}")
    print()

    if ingested:
        print(f"  {'ID':>3}  {'Chunks':>6}  Title")
        print(f"  {'-'*3}  {'-'*6}  {'-'*40}")
        for r in sorted(ingested, key=lambda x: x["id"]):
            print(f"  {r['id']:>3}  {r['chunk_count']:>6}  {r['title'][:55]}")
        print()

    if missing:
        print("  NOT INGESTED:")
        for r in missing:
            has_pdf = "✓" if r["has_pdf_url"] else "✗"
            print(f"  [{has_pdf}]  ID {r['id']:>3}  {r['title'][:60]}")
        print()

    if errors:
        print("  ERRORS:")
        for r in errors:
            print(f"  ID {r['id']:>3}  {r['title'][:50]}")
            print(f"       Error: {r['error']}")
        print()

    if verbose:
        print("  DETAILED PER-BOOK:")
        for r in results:
            meta = f"chunks={r['chunk_count']}" if r["collection_exists"] else "NOT INGESTED"
            print(f"  ID {r['id']:>3}  [{meta:12}]  {r['title'][:55]}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Check ChromaDB ingestion status")
    parser.add_argument("--book-id", type=int, help="Check a specific book only")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show per-book details")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    store = VectorStore()

    if args.book_id:
        book = next((b for b in BOOKS_DATA if b["id"] == args.book_id), None)
        if not book:
            print(f"Book with ID {args.book_id} not found in books.py")
            sys.exit(1)
        results = [check_book(store, book, args.verbose)]
    else:
        results = []
        for book in BOOKS_DATA:
            status = check_book(store, book, args.verbose)
            results.append(status)

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print_report(results, args.verbose)

    total_ingested = sum(1 for r in results if r["collection_exists"] and r["chunk_count"] > 0)
    sys.exit(0 if total_ingested > 0 else 1)


if __name__ == "__main__":
    main()
