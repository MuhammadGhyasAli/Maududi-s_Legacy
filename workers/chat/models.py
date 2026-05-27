from pydantic import BaseModel, field_validator
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
        return v.strip()

    @field_validator('author')
    @classmethod
    def author_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Author cannot be empty')
        return v.strip()

    @field_validator('description')
    @classmethod
    def description_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()

    @field_validator('imageUrl')
    @classmethod
    def image_url_must_be_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Image URL cannot be empty')
        return v.strip()

    @field_validator('pdfUrl')
    @classmethod
    def pdf_url_must_be_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('PDF URL cannot be empty')
        return v.strip()

    @field_validator('aiContext')
    @classmethod
    def ai_context_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('AI context cannot be empty')
        return v.strip()

    @field_validator('publicationYear')
    @classmethod
    def publication_year_must_be_valid(cls, v: int) -> int:
        if v < 1000 or v > datetime.now().year + 1:
            raise ValueError(f'Publication year must be between 1000 and {datetime.now().year + 1}')
        return v

    @field_validator('category')
    @classmethod
    def category_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Category cannot be empty')
        return v.strip()


class Book(BookBase):
    id: int


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
            return v.strip()
        elif isinstance(v, list):
            if not v:
                raise ValueError('Message content cannot be empty list')
            return v
        raise ValueError('Message content must be a string or a list of parts')


class ChatRequest(BaseModel):
    bookId: int
    messages: List[ChatMessage]


class GlobalChatRequest(BaseModel):
    systemInstruction: str
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    response: str
