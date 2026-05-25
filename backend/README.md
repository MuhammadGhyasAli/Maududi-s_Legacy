# Maududi's Legacy Backend

Python FastAPI backend for Maududi's Legacy application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

5. Update `.env` with your actual API keys:
```
GOOGLE_API_KEY=your_google_api_key_here
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

## Running the Backend

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Books
- `GET /api/books` - Get all books (optional category filter)
- `GET /api/books/categories` - Get all categories
- `GET /api/books/{book_id}` - Get a specific book by ID

### Chat
- `POST /api/chat` - Chat with AI about a specific book

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
