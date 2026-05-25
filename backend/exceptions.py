from typing import Any, Optional


class AppException(Exception):
    """Base exception for application errors"""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Any] = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class NotFoundException(AppException):
    """Resource not found exception"""
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(message, status_code=404, details=details)


class BadRequestException(AppException):
    """Bad request exception"""
    def __init__(self, message: str = "Bad request", details: Optional[Any] = None):
        super().__init__(message, status_code=400, details=details)





class ForbiddenException(AppException):
    """Forbidden exception"""
    def __init__(self, message: str = "Forbidden", details: Optional[Any] = None):
        super().__init__(message, status_code=403, details=details)


class ValidationException(AppException):
    """Validation exception"""
    def __init__(self, message: str = "Validation error", details: Optional[Any] = None):
        super().__init__(message, status_code=422, details=details)


class RateLimitException(AppException):
    """Rate limit exception"""
    def __init__(self, message: str = "Rate limit exceeded", details: Optional[Any] = None):
        super().__init__(message, status_code=429, details=details)


class ExternalServiceException(AppException):
    """External service exception"""
    def __init__(self, message: str = "External service error", details: Optional[Any] = None):
        super().__init__(message, status_code=502, details=details)
