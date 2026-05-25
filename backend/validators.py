from typing import Optional
from pydantic import BaseModel, field_validator, EmailStr
from fastapi import HTTPException, status


class BookCreateValidator(BaseModel):
    """Validator for book creation"""
    title: str
    author: str
    description: str
    image_url: str
    pdf_url: str
    ai_context: str
    publication_year: int
    category: str
    
    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        if len(v) > 500:
            raise ValueError('Title must be less than 500 characters')
        return v.strip()
    
    @field_validator('author')
    @classmethod
    def author_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Author cannot be empty')
        if len(v) > 200:
            raise ValueError('Author must be less than 200 characters')
        return v.strip()
    
    @field_validator('description')
    @classmethod
    def description_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Description cannot be empty')
        if len(v) > 2000:
            raise ValueError('Description must be less than 2000 characters')
        return v.strip()
    
    @field_validator('image_url')
    @classmethod
    def image_url_must_be_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Image URL cannot be empty')
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Image URL must be a valid HTTP/HTTPS URL')
        return v.strip()
    
    @field_validator('pdf_url')
    @classmethod
    def pdf_url_must_be_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('PDF URL cannot be empty')
        if not v.startswith(('http://', 'https://')):
            raise ValueError('PDF URL must be a valid HTTP/HTTPS URL')
        return v.strip()
    
    @field_validator('ai_context')
    @classmethod
    def ai_context_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('AI context cannot be empty')
        if len(v) > 5000:
            raise ValueError('AI context must be less than 5000 characters')
        return v.strip()
    
    @field_validator('publication_year')
    @classmethod
    def publication_year_must_be_valid(cls, v: int) -> int:
        from datetime import datetime
        current_year = datetime.now().year
        if v < 1000 or v > current_year + 1:
            raise ValueError(f'Publication year must be between 1000 and {current_year + 1}')
        return v
    
    @field_validator('category')
    @classmethod
    def category_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Category cannot be empty')
        if len(v) > 100:
            raise ValueError('Category must be less than 100 characters')
        return v.strip()


class UserRegisterValidator(BaseModel):
    """Validator for user registration"""
    username: str
    email: EmailStr
    password: str
    
    @field_validator('username')
    @classmethod
    def username_must_be_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Username cannot be empty')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        if not v.isalnum() and '_' not in v:
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return v.strip()
    
    @field_validator('password')
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        if not v or len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


def sanitize_string(input_string: str, max_length: Optional[int] = None) -> str:
    """Sanitize string input to prevent XSS and injection attacks"""
    if not input_string:
        return ""
    
    # Remove potentially dangerous characters
    sanitized = input_string.strip()
    
    # Remove script tags and common XSS patterns
    dangerous_patterns = ['<script', '</script>', 'javascript:', 'onerror=', 'onload=', 'onclick=']
    for pattern in dangerous_patterns:
        sanitized = sanitized.replace(pattern, '')
    
    # Truncate if max_length is specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized


def validate_book_id(book_id: int) -> int:
    """Validate book ID"""
    if book_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book ID must be a positive integer"
        )
    return book_id


def validate_category(category: str) -> str:
    """Validate category input"""
    if not category or not category.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category cannot be empty"
        )
    return sanitize_string(category, max_length=100)
