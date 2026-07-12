#!/usr/bin/env python3
"""Build vector DB for all books. Continues from where it left off."""
import sys
import io
import os
import asyncio
import traceback

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

os.chdir(os.path.join('E:', os.sep, 'AI Projects', "Maududi's legacy", 'backend'))
sys.path.insert(0, '.')

import structlog
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)
logger = structlog.get_logger()

from data.books import BOOKS_DATA
from services.vector_db.pdf_processor import PDFProcessor
from services.vector_db.chunker import TextChunker
from services.vector_db.embedder import EmbeddingService
from services.vector_db.vector_store import VectorStore

results = {"success": [], "failed": [], "skipped": []}

for i, book in enumerate(BOOKS_DATA):
    book_id = book["id"]
    title = book["title"]
    pdf_url = book.get("pdfUrl", "")
    
    print(f"\n[{i+1}/77] Book {book_id}: {title}", flush=True)
    
    if not pdf_url:
        print(f"  SKIP: No PDF URL", flush=True)
        results["skipped"].append(book_id)
        continue
    
    try:
        vs = VectorStore()
        stats = vs.get_collection_stats(book_id)
        if stats.get("count", 0) > 0:
            print(f"  EXISTS: {stats['count']} chunks", flush=True)
            results["skipped"].append(book_id)
            continue
    except Exception as e:
        print(f"  Check error: {e}", flush=True)
    
    try:
        pdf_proc = PDFProcessor()
        pdf_path = asyncio.run(pdf_proc.download_pdf(pdf_url, book_id))
        text = pdf_proc.extract_text(pdf_path)
        
        if not text or not text.strip():
            print(f"  FAIL: No text extracted", flush=True)
            results["failed"].append(book_id)
            continue
        
        print(f"  Text: {len(text)} chars", flush=True)
        
        chunker = TextChunker()
        chunks = chunker.chunk_text(text, book_id, title)
        
        if not chunks:
            print(f"  FAIL: No chunks", flush=True)
            results["failed"].append(book_id)
            continue
        
        print(f"  Chunks: {len(chunks)}", flush=True)
        
        embedder = EmbeddingService()
        chunk_texts = [c["text"] for c in chunks]
        embeddings = embedder.embed_texts(chunk_texts)
        
        print(f"  Embedded: {len(embeddings)} vectors", flush=True)
        
        vs = VectorStore()
        vs.add_documents(book_id, chunks, embeddings)
        
        final_stats = vs.get_collection_stats(book_id)
        print(f"  DONE: {final_stats.get('count', 0)} chunks in Chroma Cloud", flush=True)
        
        pdf_proc.cleanup(book_id)
        results["success"].append(book_id)
        
    except Exception as e:
        print(f"  FAIL: {e}", flush=True)
        traceback.print_exc()
        results["failed"].append(book_id)

print(f"\n{'='*50}")
print(f"BUILD COMPLETE")
print(f"Success: {len(results['success'])} books")
print(f"Skipped: {len(results['skipped'])} books")
print(f"Failed: {len(results['failed'])} books")
if results["failed"]:
    print(f"Failed IDs: {results['failed']}")
