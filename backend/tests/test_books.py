import pytest
from fastapi import status


def test_get_all_books(client):
    """Test getting all books"""
    response = client.get("/api/v1/books")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0


def test_get_book_by_id(client):
    """Test getting a specific book by ID"""
    response = client.get("/api/v1/books/1")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == 1
    assert "title" in data
    assert "author" in data


def test_get_book_not_found(client):
    """Test getting a non-existent book"""
    response = client.get("/api/v1/books/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_categories(client):
    """Test getting all categories"""
    response = client.get("/api/v1/books/categories")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)
    assert "All" in response.json()


def test_get_books_by_category(client):
    """Test filtering books by category"""
    response = client.get("/api/v1/books?category=Tafsir")
    assert response.status_code == status.HTTP_200_OK
    books = response.json()
    for book in books:
        assert book["category"] == "Tafsir"
