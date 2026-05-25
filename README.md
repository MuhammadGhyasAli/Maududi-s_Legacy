# Maududi's Legacy

A professional web application for exploring the works of Sayyid Abul A'la Maududi with AI-powered chat functionality.

## Project Structure

This project is split into frontend and backend:

- **Frontend**: Next.js (React + TypeScript)
- **Backend**: Python FastAPI

## Professional Features

### Backend
- **Structured Logging**: Using structlog for comprehensive logging
- **Error Handling**: Custom exception classes with global error middleware
- **Input Validation**: Pydantic models with field validators
- **Environment Variables**: Validated configuration with pydantic-settings
- **Database**: SQLAlchemy ORM with Alembic migrations
- **Rate Limiting**: API rate limiting with slowapi
- **API Versioning**: Versioned API endpoints (/api/v1/)
- **Security Headers**: Comprehensive security headers middleware
- **Health Checks**: Dedicated health check endpoints
- **Testing**: pytest with coverage reporting
- **Code Quality**: Black, Flake8, mypy, pre-commit hooks

### Frontend
- **Error Boundaries**: React error boundary for graceful error handling
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier
- **Type Safety**: Full TypeScript coverage

### DevOps
- **Docker Support**: Docker and docker-compose for containerization
- **Pre-commit Hooks**: Automated code quality checks

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `backend/.env` file from the example:
```bash
cd backend
cp .env.example .env
```

6. Update `backend/.env` with your real API keys / secrets:
```
GOOGLE_API_KEY=your_google_api_key_here
DATABASE_URL=sqlite:///./maududi_legacy.db
JWT_SECRET_KEY=your-secret-key-change-in-production
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

7. Initialize pre-commit hooks:
```bash
pre-commit install
```

8. Run database migrations:
```bash
alembic upgrade head
```

9. Start the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Install dependencies (from root directory):
```bash
npm install
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Docker Setup

Using docker-compose for full-stack development:

```bash
docker-compose up
```

This will start:
- Backend API on port 8000
- Frontend on port 3000
- PostgreSQL database on port 5432

## Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov
```

### Frontend Tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

## Code Quality

### Backend
```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .

# Run pre-commit hooks
pre-commit run --all-files
```

### Frontend
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## API Endpoints

### Books
- `GET /api/v1/books` - Get all books (optional `?category=` filter)
- `GET /api/v1/books/categories` - Get all categories
- `GET /api/v1/books/{book_id}` - Get a specific book by ID

### Chat
- `POST /api/v1/chat` - Chat with AI about a specific book
- `POST /api/v1/chat/global` - Global AI chat (AI Context Finder)

### Health
- `GET /health` - Health check endpoint

## API Documentation

Once the backend server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

### Backend (.env)
- `GOOGLE_API_KEY` - Google AI API key for Gemini
- `DATABASE_URL` - Database connection string
- `PORT` - Server port (default: 8000)
- `CORS_ORIGINS` - Allowed CORS origins
- `RATE_LIMIT_REQUESTS` - Rate limit requests per period
- `RATE_LIMIT_PERIOD` - Rate limit period in seconds
- `LOG_LEVEL` - Logging level (INFO, DEBUG, etc.)

### Frontend (.env)
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
- `NEXT_PUBLIC_API_KEY` - Google AI API key

## Security Features

- Rate limiting (slowapi)
- CORS configuration
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS, Referrer-Policy)
- Input validation (Pydantic)
- SQL injection prevention (via SQLAlchemy ORM)
