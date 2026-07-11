# Maududi's Legacy — Backend

A FastAPI backend for Maududi's Legacy: book catalog, AI chat (Groq), JWT auth, Google OAuth, and conversation persistence. Data is stored in **MongoDB**; rate limiting via `slowapi`.

## Tech Stack

- **Framework:** FastAPI 0.115 + Uvicorn
- **Validation:** Pydantic 2 + pydantic-settings
- **Database:** MongoDB (`pymongo[srv]`)
- **Auth:** JWT (HS256) via `python-jose`, password hashing via `passlib[bcrypt]`
- **AI:** Groq (`groq` SDK), models `llama-3.3-70b-versatile` / `llama-3.2-11b-vision-preview`
- **OAuth:** Google (`google-auth`)
- **Rate limiting:** `slowapi`
- **Logging:** `structlog`
- **Email:** `email-validator` (Nodemailer-equivalent sending handled in the frontend; backend issues tokens)

## Project Structure

```
backend/
  main.py              # App entrypoint, middleware, router registration
  config.py            # pydantic-settings configuration
  database.py          # MongoDB connection + init
  auth.py              # JWT helpers (FastAPI layer)
  middleware.py        # Logging + security headers
  exceptions.py        # Custom exceptions + handlers
  logger.py            # structlog setup
  routers/             # auth.py, books.py, chat.py
  services/            # groq_service.py, email, etc.
  models/              # Pydantic models (book, user, chat)
  repositories/        # MongoDB data-access layer
  data/                # Seed book data
  validators.py        # Input validators
  tests/               # pytest suite
```

## Prerequisites

- **Python 3.11+** (see note below)

> **Python version mismatch (deploy risk):** `runtime.txt` pins `python-3.10.12` (PythonAnywhere), but `pyproject.toml` requires `>=3.11` and `Dockerfile` uses `python:3.11-slim`. Bundled wheels are `cp313`. Use **Python 3.11+** and align all targets before deploying.

## Install & Run

```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# Linux/Mac: source venv/bin activate
pip install -r requirements.txt

# Create backend/.env from the variable list below (no committed .env.example)
python main.py
# or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API runs on `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs` and `/redoc`.

On **Vercel**, `init_db()` is skipped (`main.py` checks the `VERCEL` env var) and `vercel.json` routes `/health` and `/api/*` to `main.py`.

## Environment Variables

Create `backend/.env` (gitignored). There is no committed `.env.example`; use the list below.

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | Yes (chat) | — | Groq API key |
| `PORT` | No | `8000` | Listen port |
| `CORS_ORIGINS` | Yes | localhost:5173,3000 | Comma-separated allowed origins (no trailing slash) |
| `MONGODB_URL` | Yes | — | MongoDB connection string |
| `MONGODB_DB_NAME` | No | `maududi_legacy` | Database name |
| `JWT_SECRET_KEY` | Yes | — | JWT signing secret (use a strong random value; empty/weak values only warn) |
| `JWT_ALGORITHM` | No | `HS256` | JWT algorithm |
| `JWT_EXPIRATION_MINUTES` | No | `1440` | Token lifetime |
| `RATE_LIMIT_REQUESTS` | No | `100` | Rate-limit count |
| `RATE_LIMIT_PERIOD` | No | `60` | Rate-limit window (seconds) |
| `LOG_LEVEL` | No | `INFO` | Logging level |
| `CACHE_TTL_SECONDS` | No | `300` | In-memory cache TTL |
| `CACHE_MAXSIZE` | No | `1000` | In-memory cache size |
| `GOOGLE_OAUTH_CLIENT_ID` | For Google login | — | OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | For Google login | — | OAuth client secret |
| `PASSWORD_RESET_TTL_MINUTES` | No | `30` | Reset token lifetime |
| `DEV_RETURN_PASSWORD_RESET_TOKEN` | No | `false` | **Never enable in production** — returns reset tokens in the API response |
| `GROQ_MODEL_TEXT` | No | `llama-3.3-70b-versatile` | Text model |
| `GROQ_MODEL_VISION` | No | `llama-3.2-11b-vision-preview` | Vision model |

## API Endpoints

All routes are prefixed with `/api/v1`.

**Health / root**
- `GET /` — service info
- `GET /health` — health check

**Auth** (`/api/v1/auth`)
- `POST /login`
- `POST /register`
- `POST /google`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /logout`
- `GET /me`

**Books** (`/api/v1/books`)
- `GET /` — all books (`?category=`, `?search=` supported)
- `GET /categories` — all categories
- `GET /{book_id}` — single book

**Chat** (`/api/v1/chat`)
- `POST /` — book-scoped chat
- `POST /global` — global AI context finder
- `GET /conversations` — list conversations
- `GET /conversations/{conversation_id}` — conversation detail
- `DELETE /conversations/{conversation_id}` — delete conversation
- `POST /conversations/{conversation_id}/share` — share conversation
- `GET /shared/{share_id}` — shared conversation
- `POST /branch` — branch a conversation
- `GET /suggestions` — book suggestions

## Security Notes (action required)

- **Password reset:** `forgot-password` accepts `?return_token=true` and will return the raw reset token whenever `DEV_RETURN_PASSWORD_RESET_TOKEN` is set. This is an account-takeover risk — never enable it in production, and deliver tokens only via email.
- **Auth rate limiting:** auth routes are **not** currently decorated with `@limiter.limit(...)`; add limits to login/register/forgot/reset to prevent brute force.
- **CORS:** `CORS_ORIGINS` is matched exactly — a trailing slash (e.g. `https://example.com/`) will not match the browser origin.
- **Docs in prod:** `/docs` and `/redoc` are publicly exposed; disable them in production.
- **JWT secret:** an empty/`change-me` secret only emits a warning — fail fast in production instead.

## Testing

```bash
pytest                 # run tests
pytest --cov           # coverage
```

> Note: `tests/conftest.py` currently builds a SQLAlchemy engine, but the app uses MongoDB — the test suite needs updating to use a Mongo test container or `mongomock` before it can run.
