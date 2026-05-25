from fastapi import Request, status
from fastapi.responses import JSONResponse
from structlog import get_logger
from exceptions import AppException
import time

logger = get_logger(__name__)


async def app_exception_handler(request: Request, exc: AppException):
    logger.error(
        "Application error",
        status_code=exc.status_code,
        message=exc.message,
        details=exc.details,
        path=request.url.path,
        method=request.method
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "details": exc.details,
            "status_code": exc.status_code
        }
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unexpected error",
        error=str(exc),
        path=request.url.path,
        method=request.method
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "status_code": 500
        }
    )

async def logging_middleware(request: Request, call_next):
    """Request logging middleware"""
    start_time = time.time()
    
    logger.info(
        "Request started",
        method=request.method,
        path=request.url.path,
        client_host=request.client.host if request.client else None
    )
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        "Request completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        process_time=process_time
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    return response
