import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from data.books import BOOKS_DATA
from models.db_models import BookModel

# Use a separate SQLite database for testing to avoid wiping the development database
TEST_DATABASE_URL = "sqlite:///./test_maududi_legacy.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        # Seed test database with books so book tests pass
        for book_data in BOOKS_DATA:
            db_book = BookModel(
                id=book_data["id"],
                title=book_data["title"],
                author=book_data["author"],
                description=book_data["description"],
                image_url=book_data["imageUrl"],
                pdf_url=book_data["pdfUrl"],
                ai_context=book_data["aiContext"],
                publication_year=book_data["publicationYear"],
                category=book_data["category"]
            )
            session.add(db_book)
        session.commit()
        
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client(db_session):
    """Create a test client with database session override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
