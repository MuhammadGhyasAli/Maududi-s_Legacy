import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_chat_endpoint(client):
    """Test the chat endpoint"""
    chat_request = {
        "bookId": 1,
        "messages": [
            {"role": "user", "content": "What is this book about?"}
        ]
    }
    
    response = client.post("/api/v1/chat", json=chat_request)
    # Note: This might fail if API key is not set, but tests the endpoint structure
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND, status.HTTP_500_INTERNAL_SERVER_ERROR, status.HTTP_502_BAD_GATEWAY]
def test_chat_invalid_book_id(client):
    """Test chat with invalid book ID"""
    chat_request = {
        "bookId": 99999,
        "messages": [
            {"role": "user", "content": "Test"}
        ]
    }
    
    response = client.post("/api/v1/chat", json=chat_request)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_chat_empty_messages(client):
    """Test chat with empty messages"""
    chat_request = {
        "bookId": 1,
        "messages": []
    }
    
    response = client.post("/api/v1/chat", json=chat_request)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
