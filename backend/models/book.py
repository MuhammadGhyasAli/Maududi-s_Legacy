from pydantic import BaseModel, field_validator, HttpUrl
from typing import Optional, List, Union, Dict, Any
from datetime import datetime

class BookBase(BaseModel):
    title: str
    author: str
    description: str
    imageUrl: str
    pdfUrl: str
    aiContext: str
    publicationYear: int
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
    
    @field_validator('imageUrl')
    @classmethod
    def image_url_must_be_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Image URL cannot be empty')
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Image URL must be a valid HTTP/HTTPS URL')
        return v.strip()
    
    @field_validator('pdfUrl')
    @classmethod
    def pdf_url_must_be_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('PDF URL cannot be empty')
        if not v.startswith(('http://', 'https://')):
            raise ValueError('PDF URL must be a valid HTTP/HTTPS URL')
        return v.strip()
    
    @field_validator('aiContext')
    @classmethod
    def ai_context_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('AI context cannot be empty')
        if len(v) > 5000:
            raise ValueError('AI context must be less than 5000 characters')
        return v.strip()
    
    @field_validator('publicationYear')
    @classmethod
    def publication_year_must_be_valid(cls, v: int) -> int:
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

class Book(BookBase):
    id: int
    
    @field_validator('id')
    @classmethod
    def id_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError('ID must be a positive integer')
        return v

class BookResponse(Book):
    pass

class ChatMessage(BaseModel):
    role: str
    content: Union[str, List[Dict[str, Any]]]
    
    @field_validator('role')
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        valid_roles = ['user', 'assistant', 'system']
        if v.lower() not in valid_roles:
            raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return v.lower()
    
    @field_validator('content')
    @classmethod
    def content_must_not_be_empty(cls, v: Union[str, List[Dict[str, Any]]]) -> Union[str, List[Dict[str, Any]]]:
        if isinstance(v, str):
            if not v or not v.strip():
                raise ValueError('Message content cannot be empty string')
            if len(v) > 10000:
                raise ValueError('Message content must be less than 10000 characters')
            return v.strip()
        elif isinstance(v, list):
            if not v:
                raise ValueError('Message content cannot be empty list')
            return v
        raise ValueError('Message content must be a string or a list of parts')

class ChatRequest(BaseModel):
    bookId: int
    messages: List[ChatMessage]
    conversationId: Optional[int] = None
    language: str = "English"
    
    @field_validator('bookId')
    @classmethod
    def book_id_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError('Book ID must be a positive integer')
        return v
    
    @field_validator('messages')
    @classmethod
    def messages_must_not_be_empty(cls, v: List[ChatMessage]) -> List[ChatMessage]:
        if not v:
            raise ValueError('Messages list cannot be empty')
        if len(v) > 100:
            raise ValueError('Messages list cannot exceed 100 messages')
        return v

class GlobalChatRequest(BaseModel):
    systemInstruction: str
    messages: List[ChatMessage]
    conversationId: Optional[int] = None
    language: str = "English"
    
    @field_validator('systemInstruction')
    @classmethod
    def instruction_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('System instruction cannot be empty')
        return v.strip()

    @field_validator('messages')
    @classmethod
    def messages_must_not_be_empty(cls, v: List[ChatMessage]) -> List[ChatMessage]:
        if not v:
            raise ValueError('Messages list cannot be empty')
        if len(v) > 100:
            raise ValueError('Messages list cannot exceed 100 messages')
        return v

class ChatResponse(BaseModel):
    response: str
    
    @field_validator('response')
    @classmethod
    def response_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Response cannot be empty')
        return v.strip()
