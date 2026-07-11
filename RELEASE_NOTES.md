# Release Notes — Maududi's Legacy

> Living changelog. Items marked **OPEN** are known issues from the security/code audit that are **not yet fixed** and should be addressed before relying on the app in production.

## Current Version

- Frontend: `1.0.1` (Next.js 15 App Router)
- Backend: `1.0.1` (FastAPI)

## Shipped Fixes (verified against code)

- **Auth routing** — frontend API calls use `/api/v1/...`, matching the backend router prefixes (`backend/main.py` registers `auth`, `books`, `chat` under `/api/v1`).
- **Chat router included** — `chat.router` is registered in the FastAPI app, so AI chat works.
- **Login field** — frontend sends `username` to match the backend auth schema.
- **Vercel deployment** — `process.env.VERCEL` guard retained in `next.config.mjs` rewrites; `backend/vercel.json` routes `/health` and `/api/*` to `main.py`.
- **JWT secret validation** — `backend/config.py` warns when the JWT secret is empty or the default value.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy` set in both frontend middleware and backend.
- **UI** — collapsible sidebar, theme toggle, keyboard shortcuts, reading-history; version bumped to `1.0.1`.

## OPEN — Critical (fix before production)

- **SSRF in `/api/pdf-proxy`** (frontend) — the proxy fetches any external URL with `redirect: 'follow'` and returns `Access-Control-Allow-Origin: *`. Add a strict host allowlist, disable auto-redirects (or re-validate the final URL), restrict CORS, and enforce PDF content-type + size limits.
- **Password-reset token disclosure** (backend) — `POST /api/v1/auth/forgot-password?return_token=true` returns the raw reset token (also enabled by `DEV_RETURN_PASSWORD_RESET_TOKEN`). Remove the parameter, deliver tokens only via email, and never enable the dev flag in production.

## OPEN — High

- **No server-side rate limiting** on auth/chat endpoints (frontend and backend). Login is brute-forceable; `/chat/global` is an unauthenticated, client-prompt-controllable LLM proxy (quota drain).
- **Logout** — frontend `logout()` calls a `DELETE /api/auth/me` that clears the cookie, but the client path should be verified end-to-end; ensure the `auth_token` cookie is always cleared.
- **Secrets in plaintext `.env`** — live MongoDB URL, Groq key, JWT secret, and Google OAuth secret sit in gitignored-but-on-disk `.env` files. Rotate and move to a secrets manager.
- **`Secure` cookie flag** only set when `VERCEL === '1'`; set `Secure` on any HTTPS origin.

## OPEN — Medium / Housekeeping

- Cookie `Max-Age` (7d) vs JWT expiry (1d) mismatch.
- Backend CORS origin with trailing slash breaks production matching.
- `/docs` and `/redoc` exposed in production.
- Backend test suite references SQLAlchemy but the app uses MongoDB — update `tests/conftest.py`.
- Python version mismatch across `runtime.txt` (3.10), `pyproject.toml`/`Dockerfile` (3.11), and bundled `cp313` wheels.
- Documentation consolidated: removed fictional `SYSTEM_DOCUMENTATION.md`, `AI_Features_Report.md`, `ENVIRONMENT_SETUP.md`, `QUICK_START.md`, and the generated `dataconnect-generated` READMEs; rewrote `README.md` (frontend) and `backend/README.md` from the actual code.
