from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from config import settings
from logger import setup_logging, get_logger
from middleware import logging_middleware, app_exception_handler, global_exception_handler
from routers import books, chat
from exceptions import AppException

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Maududi's Legacy Backend...")
    yield
    # Shutdown
    logger.info("Shutting down Maududi's Legacy Backend...")

app = FastAPI(
    title="Maududi's Legacy API",
    description="Backend API for Maududi's Legacy application",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=True,
)

# Exception handlers (This preserves CORS!)
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware (security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)

# Custom middleware
app.add_middleware(BaseHTTPMiddleware, dispatch=logging_middleware)

# Security headers middleware
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Include routers with API versioning
app.include_router(books.router, prefix="/api/v1/books", tags=["books"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/")
@limiter.limit(f"{settings.rate_limit_requests}/{settings.rate_limit_period} seconds")
async def root(request: Request):
    return {"message": "Maududi's Legacy API is running", "version": "1.0.0"}

@app.get("/health")
@limiter.limit(f"{settings.rate_limit_requests}/{settings.rate_limit_period} seconds")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "maududi-legacy-api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)
