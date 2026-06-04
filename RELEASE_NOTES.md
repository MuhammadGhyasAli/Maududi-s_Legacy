## What's Changed

### 🔴 Critical Fixes
- **Removed global SSL verification disable** — the database module no longer monkey-patches `ssl.create_default_context` with `CERT_NONE`, eliminating a MITM vulnerability
- **Added JWT secret validation** — warns if the default secret is still in use

### 🟠 Major Bug Fixes
- **Fixed auth API routing** — frontend API calls now use `/api/v1/...` matching the backend router prefix, fixing all login/register/me endpoints
- **Included chat router** — added `chat.router` to FastAPI app so AI chat features actually work
- **Fixed login field mismatch** — frontend now sends `username` (not `email`) to match the backend schema
- **Fixed Vercel deployment** — restored `process.env.VERCEL` guard in next.config rewrites; cleaned up vercel.json

### 🟡 Moderate Fixes
- **Fixed duplicate GroqService** — `llm_service.py` now imports the singleton instead of creating a second instance
- **Fixed stale closure in ChatPage** — replaced `apiMessages` state with `useRef` to prevent stale message history
- **Deduplicated `getLangProps`** — extracted shared utility to `utils/language.ts`
- **Removed duplicate `import os`** in `main.py`
- **Removed unused `removeFromStorage`** from apiService
- **Fixed test file** — updated `chat` test to match the correct method signature

### 🎨 UI
- **Sidebar starts collapsed** by default — shows only icons in a small `w-16` area
- **Added `overflow-x-hidden`** to sidebar and nav to prevent horizontal scroll
- **Version bumped** to 1.0.1
