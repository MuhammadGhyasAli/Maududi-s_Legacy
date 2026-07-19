from dotenv import load_dotenv
import os
_env_path = os.path.join(os.path.dirname(__file__), ".env")
if not os.path.isfile(_env_path):
    _env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(os.path.abspath(_env_path))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from logger import setup_logging, get_logger
from middleware import logging_middleware, app_exception_handler, global_exception_handler
from routers import books, auth, chat
from exceptions import AppException
from database import init_db

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Maududi's Legacy Backend...")
    if not os.environ.get('VERCEL'):
        init_db()
    yield
    # Shutdown
    logger.info("Shutting down Maududi's Legacy Backend...")

app = FastAPI(
    title="Maududi's Legacy API",
    description="Backend API for Maududi's Legacy application",
    version="1.1.1",
    lifespan=lifespan,
    docs_url="/docs" if os.environ.get("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.environ.get("ENVIRONMENT") != "production" else None,
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

# Request body size limit (10 MB)
MAX_BODY_SIZE = 10 * 1024 * 1024

@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_BODY_SIZE:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=413, content={"detail": "Request body too large (max 10 MB)"})
    return await call_next(request)

# Custom middleware (registered as ASGI middleware to avoid BaseHTTPMiddleware caveats)
app.middleware("http")(logging_middleware)

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
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(books.router, prefix="/api/v1/books", tags=["books"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/")
@limiter.limit(f"{settings.rate_limit_requests}/{settings.rate_limit_period} seconds")
async def root(request: Request):
    return {"message": "Maududi's Legacy API is running", "version": "1.1.1"}



@app.get("/health")
@limiter.limit(f"{settings.rate_limit_requests}/{settings.rate_limit_period} seconds")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "version": "1.1.1",
        "service": "maududi-legacy-api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)
