# Maududi's Legacy — Frontend

A Next.js 15 (App Router) web application for exploring the works of Sayyid Abul A'la Maududi, with AI-powered chat, Google OAuth login, PDF reading, and text-to-speech.

> **Topology:** This is the frontend, but it also ships its own Next.js route handlers under `src/app/api/*` (auth, chat, PDF proxy, etc.). For book catalog, conversation persistence, and the public `/api/v1/*` surface it talks to a separate FastAPI backend — see [`backend/README.md`](../backend/README.md) — configured via `NEXT_PUBLIC_API_BASE_URL`.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Database:** MongoDB (via `mongodb` driver) — users, conversations, reading history
- **AI chat:** Groq (`src/lib/groq.ts`), with multi-key fallback (`GROQ_API_KEY`, `GROQ_API_KEY_1..5`)
- **Auth:** JWT in an HttpOnly cookie + Google OAuth (`google-auth-library`)
- **Email:** Nodemailer (password reset / verification)
- **PDF:** `react-pdf` + `pdfjs-dist`, served through an internal proxy (`/api/pdf-proxy`)

## Project Structure

```
src/
  app/                 # Routes (pages) + API route handlers
    (auth)/            # Login / register / forgot / reset / verify UI
    [category]/        # Book listing + book detail + chat pages
    ai-context-finder/ # Global AI search
    api/               # Next.js API route handlers (see below)
    account/ about/ biography/ privacy/ terms/ health/
  components/          # UI components (chat, icons, layout, ...)
  contexts/            # React contexts (auth, theme, ...)
  hooks/               # Custom hooks
  lib/                 # mongodb.ts, jwt.ts, groq.ts, auth.ts
  services/            # API client + external service wrappers
  types/ utils/        # Shared types & helpers
```

## Prerequisites

- Node.js 18+ and npm

## Install & Run

```bash
npm install
npm run dev        # http://localhost:3000
```

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server (`next dev -H 0.0.0.0 -p 3000`) |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Serve the production build (`next start -p 3000`) |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with coverage |
| `npm run lint` | ESLint (errors only, zero warnings allowed) |
| `npm run format` | Prettier write |

## Environment Variables

Create a `.env` file in the project root (it is **gitignored** — never commit it). There is no committed `.env.example`; use the list below.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base URL of the FastAPI backend (e.g. `https://backend-phi-eosin-87.vercel.app`). Used for `/api/v1/...` calls. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For Google login | Google OAuth client ID. |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | For Google login | e.g. `http://localhost:3000/auth/google/callback` |
| `MONGODB_URL` | Yes | MongoDB connection string (used by the Next.js API routes). |
| `MONGODB_DB_NAME` | No | DB name (default `maududi_legacy`). |
| `GROQ_API_KEY` | Yes (chat) | Groq API key. Up to 5 keys supported: `GROQ_API_KEY_1` … `GROQ_API_KEY_5`. |
| `JWT_SECRET_KEY` | Yes | Secret used to sign/verify the session JWT (must match the backend). |
| `JWT_ALGORITHM` | No | HS256 (default). |
| `JWT_EXPIRATION_MINUTES` | No | 1440 (default). |
| `GMAIL_USER` | For email | Gmail address used to send reset/verification mail. |
| `GMAIL_APP_PASSWORD` | For email | Gmail app-specific password. |
| `GOOGLE_OAUTH_CLIENT_ID` | For Google login | Server-side OAuth client ID. |
| `GOOGLE_OAUTH_CLIENT_SECRET` | For Google login | Server-side OAuth client secret. |
| `VERCEL` | Auto | Set to `1` on Vercel (used to enable Secure cookies and skip rewrites). |

> **Secrets:** Never paste real secret values into docs or commits. Rotate `JWT_SECRET_KEY`, `GROQ_API_KEY`, `MONGODB_URL`, and `GOOGLE_OAUTH_CLIENT_SECRET` if they have been exposed.

## Built-in API Routes (`src/app/api`)

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | Email/password login → sets `auth_token` cookie |
| `/api/auth/register` | POST | Register + send verification code |
| `/api/auth/verify-email` | POST | Verify email with code |
| `/api/auth/me` | GET / PUT / DELETE | Current user (DELETE clears the cookie) |
| `/api/auth/password` | PUT | Change password |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/google` | POST | Google OAuth sign-in |
| `/api/chat` | POST | Book-scoped AI chat (Groq) |
| `/api/chat/global` | POST | Global AI context finder (Groq) |
| `/api/reading-history` | POST / GET | Reading-history persistence |
| `/api/pdf-proxy` | GET / HEAD / OPTIONS | Proxies external PDFs for the viewer |
| `/api/tts` | — | Text-to-speech |
| `/api/v1/books` | GET | All books (optional `?category=` / `?search=`) |
| `/api/v1/books/categories` | GET | All categories |
| `/api/v1/books/[bookId]` | GET | Single book |

## Notes & Known Gaps

- The `/api/pdf-proxy` route currently allows any external URL and sets permissive CORS — an SSRF risk that should be locked down with a host allowlist before production use.
- Some client methods reference endpoints that only exist on the external backend (e.g. conversation share/suggestions); ensure `NEXT_PUBLIC_API_BASE_URL` points at a backend exposing `/api/v1/chat/conversations`, `/share`, `/suggestions`.
- ESLint is configured to fail on warnings (`--max-warnings 0`); `@typescript-eslint/no-explicit-any` is relaxed.
