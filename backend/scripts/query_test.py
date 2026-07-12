#!/usr/bin/env python3
"""
Test query against the vector database.

Usage:
    python scripts/query_test.py "What is the meaning of life?"
    python scripts/query_test.py "What is zakat?" --book-id 1
    python scripts/query_test.py "تقویٰ کیا ہے" --book-id 5
"""

import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from services.vector_db.retriever import RetrieverService


def main():
    parser = argparse.ArgumentParser(description="Test vector DB query")
    parser.add_argument("query", help="Query text")
    parser.add_argument("--book-id", type=int, help="Specific book ID to query")
    parser.add_argument("--n-results", type=int, default=5, help="Number of results")

    args = parser.parse_args()

    retriever = RetrieverService()

    print(f"\nQuery: {args.query}")
    if args.book_id:
        print(f"Book ID: {args.book_id}")
    print(f"Results: {args.n_results}\n")

    results = retriever.retrieve_with_metadata(
        query=args.query,
        book_id=args.book_id,
        n_results=args.n_results,
    )

    if not results:
        print("No results found.")
        return

    print("=" * 60)
    for i, result in enumerate(results, 1):
        text = result.get("text", "")
        metadata = result.get("metadata", {})
        distance = result.get("distance", 0)

        print(f"\n[Result {i}]")
        print(f"Book: {metadata.get('book_title', 'Unknown')}")
        print(f"Chunk: {metadata.get('chunk_index', 0) + 1}/{metadata.get('total_chunks', 0)}")
        print(f"Distance: {distance:.4f}")
        print(f"\nText:\n{text[:500]}...")
        print("-" * 60)


if __name__ == "__main__":
    main()
