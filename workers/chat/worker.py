import os
import logging
from typing import Optional

from workers import WorkerEntrypoint
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
import asgi

from models import (
    ChatRequest, ChatResponse, GlobalChatRequest,
    Book, BookResponse
)
from books_data import BOOKS_DATA, CATEGORIES
from groq_service import groq_service

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
logger = logging.getLogger("maududi")

app = FastAPI(title="Maududi's Legacy API")

cors_origins_str = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
cors_origins = [o.strip() for o in cors_origins_str.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_books() -> list[Book]:
    return [Book(**b) for b in BOOKS_DATA]


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "maududi-legacy-chat"}


@app.get("/api/v1/books", response_model=list[BookResponse])
async def get_books(category: Optional[str] = None):
    logger.info("Fetching books", extra={"category": category})
    all_books = _get_books()
    if category and category != "All":
        return [b for b in all_books if b.category.lower() == category.lower()]
    return all_books


@app.get("/api/v1/books/categories", response_model=list[str])
async def get_categories():
    logger.info("Fetching categories")
    return CATEGORIES


@app.get("/api/v1/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: int):
    logger.info("Fetching book", extra={"book_id": book_id})
    for b in _get_books():
        if b.id == book_id:
            return b
    raise HTTPException(status_code=404, detail=f"Book with id {book_id} not found")


@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    book_id = request.bookId
    messages = [m.model_dump() for m in request.messages]

    book = None
    for b in BOOKS_DATA:
        if b["id"] == book_id:
            book = b
            break

    if not book:
        raise HTTPException(status_code=404, detail=f"Book with id {book_id} not found")

    system_instruction = book["aiContext"]
    logger.info("Chat request received", extra={"book_id": book_id, "message_count": len(messages)})

    result = await groq_service.chat(system_instruction, messages)

    if result.get("error"):
        logger.error("Chat generation failed", extra={"book_id": book_id, "error": result["message"]})
        raise HTTPException(status_code=502, detail=result["message"])

    return ChatResponse(response=result["response"])


@app.post("/api/v1/chat/global", response_model=ChatResponse)
async def global_chat(request: GlobalChatRequest):
    messages = [m.model_dump() for m in request.messages]
    logger.info("Global chat request received", extra={"message_count": len(messages)})

    result = await groq_service.chat(request.systemInstruction, messages)

    if result.get("error"):
        logger.error("Global chat failed", extra={"error": result["message"]})
        raise HTTPException(status_code=502, detail=result["message"])

    return ChatResponse(response=result["response"])


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return await asgi.fetch(app, request, self.env)
