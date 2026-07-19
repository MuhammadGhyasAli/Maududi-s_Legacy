# Release Notes — Maududi's Legacy

> Living changelog. Items marked **OPEN** are known issues from the security/code audit that are **not yet fixed** and should be addressed before relying on the app in production.

## Current Version

- Frontend: `1.1.0` (Next.js 15 App Router)
- Backend: `1.2.0` (FastAPI)

## v1.1.0 / v1.2.0 — Security & Architecture Hardening

### CRITICAL — Security Fixes

- **SSRF in `/api/pdf-proxy` (FIXED)** — Added domain allowlist (archive.org, jamaatpk.b-cdn.net, jamaatwomen.org), disabled auto-redirects (manual redirect validation), removed `Access-Control-Allow-Origin: *`, added 50 MB size limit, 15s timeout.
- **Password-reset token disclosure (FIXED)** — Removed `return_token` query parameter and `DEV_RETURN_PASSWORD_RESET_TOKEN` config flag. Tokens are now only deliverable via email (TODO: implement email sending).
- **Auth rate limiting (FIXED)** — Added `slowapi` rate limits: login 10/min, register 5/min, forgot-password 3/min, reset-password 5/min.
- **Cookie `Secure` flag (FIXED)** — Changed from `process.env.VERCEL === '1'` to `request.url.scheme == 'https'` (backend) and `request.url.startsWith('https://')` (frontend). Now works on any HTTPS host.

### HIGH — Architecture Fixes

- **MongoDB connection (FIXED)** — Added retry logic (3 attempts with exponential backoff), serverless-aware client creation, disconnect event handler, 60s cooldown after failure instead of permanent `_mongodb_failed` cache.
- **Sync HTTP in async context (FIXED)** — Converted `GroqService` to support both sync (`chat`) and async (`achat`) via `httpx.AsyncClient`. Converted `SynthesizerAgent` to use `async with httpx.AsyncClient`. Made `OrchestratorAgent.classify()` async. Added `LLMService.agenerate_response()`.

### MEDIUM — Code Quality

- **Duplicated conversation persistence (FIXED)** — Extracted ~120 lines of repeated conversation save logic into `backend/services/conversation_service.py:persist_conversation()`.
- **Imports inside function bodies (FIXED)** — Moved `import json` to module level in `chat.py`.
- **CSP tightened (FIXED)** — Added `object-src 'none'`, `Permissions-Policy` (camera=(), microphone=(), geolocation=()).
- **JWT error leaking internals (FIXED)** — Sanitized error messages in `decode_access_token` and `google_auth` to not expose internal details.
- **Docs/Redoc in production (FIXED)** — `/docs` and `/redoc` now disabled when `ENVIRONMENT=production`.

### Files Changed (21)

**Backend (11 files):**
- `backend/config.py` — removed `dev_return_password_reset_token`
- `backend/database.py` — retry logic, cooldown, removed `_mongodb_failed`
- `backend/main.py` — conditional docs/redoc
- `backend/routers/auth.py` — rate limiting, cookie secure fix, sanitized errors, password reset fix
- `backend/routers/chat.py` — extracted persistence, removed inline imports
- `backend/services/agent_pipeline.py` — async orchestrator/fallback
- `backend/services/agents/orchestrator.py` — async classify
- `backend/services/agents/synthesizer.py` — async httpx streaming
- `backend/services/groq_service.py` — async client support
- `backend/services/llm_service.py` — async generate_response
- `backend/services/conversation_service.py` (NEW) — shared persistence

**Frontend (10 files):**
- `src/app/api/pdf-proxy/route.ts` — SSRF fix, allowlist, size limit
- `src/app/api/auth/google/route.ts` — cookie secure fix
- `src/app/api/auth/login/route.ts` — cookie secure fix
- `src/app/api/auth/logout/route.ts` — cookie secure fix
- `src/app/api/auth/me/route.ts` — cookie secure fix
- `src/app/api/auth/verify-email/route.ts` — cookie secure fix
- `src/app/api/chat/route.ts` — cookie secure fix
- `src/lib/auth.ts` — cookie secure fix
- `src/lib/mongodb.ts` — retry, serverless handling, disconnect recovery
- `src/middleware.ts` — CSP tightened, Permissions-Policy

## Previously Shipped Fixes

- **Auth routing** — frontend API calls use `/api/v1/...`, matching the backend router prefixes.
- **Chat router included** — `chat.router` is registered in the FastAPI app, so AI chat works.
- **Login field** — frontend sends `username` to match the backend auth schema.
- **Vercel deployment** — `process.env.VERCEL` guard retained in `next.config.mjs` rewrites; `backend/vercel.json` routes `/health` and `/api/*` to `main.py`.
- **JWT secret validation** — `backend/config.py` warns when the JWT secret is empty or the default value.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy` set in both frontend middleware and backend.
- **UI** — collapsible sidebar, theme toggle, keyboard shortcuts, reading-history; version bumped to `1.0.1`.

## OPEN — Remaining Items

- **Secrets in plaintext `.env`** — live MongoDB URL, Groq key, JWT secret, and Google OAuth secret sit in gitignored-but-on-disk `.env` files. Rotate and move to a secrets manager.
- **Cookie `Max-Age` (7d) vs JWT expiry (1d) mismatch** — consider aligning these.
- **Backend CORS origin with trailing slash** — may break production matching.
- **Backend test suite references SQLAlchemy** — update `tests/conftest.py` to use MongoDB fixtures.
- **Python version mismatch** — `runtime.txt` (3.10), `pyproject.toml`/`Dockerfile` (3.11), bundled `cp313` wheels.
- **Researcher agent is placeholder** — no vector search/embeddings, returns empty context. Implement real RAG pipeline.
- **Password reset email delivery** — TODO: implement email sending for reset tokens.
