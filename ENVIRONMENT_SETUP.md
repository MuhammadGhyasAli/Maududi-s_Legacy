# Environment Setup Guide

## Frontend Configuration (.env)
Create a local `.env` in the project root by copying from `.env.example`:

```
cp .env.example .env
```

**Key Variables:**
- `NEXT_PUBLIC_API_BASE_URL`: Points to your backend API (must be running)
- `NEXT_PUBLIC_API_KEY`: Google API key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID (if using Google login)

## Backend Configuration (backend/.env)
Create `backend/.env` by copying from `backend/.env.example`:

```
cd backend
cp .env.example .env
```

**Key Variables:**
- `CORS_ORIGINS`: Allowed frontend origins (update when deployed)
- `DATABASE_URL`: SQLite for development (switch to PostgreSQL for production)
- `GOOGLE_API_KEY`: Required for backend API calls
- `JWT_SECRET_KEY`: Secret for token generation (change in production)
- `LOG_LEVEL`: INFO for development, DEBUG for troubleshooting

## Docker Environment
When using Docker Compose, environment variables are set automatically. See `docker-compose.yml` for mapping.

## Troubleshooting Connection Issues

### Issue: "Cannot connect to API at http://localhost:8000"

**Checklist:**
1. ✅ Backend started: Run `python main.py` in the backend directory
2. ✅ Port 8000 is free: Run `netstat -ano | findstr :8000` on Windows
3. ✅ Firewall allows: Check Windows Firewall settings
4. ✅ Environment file exists: Check `.env` in root and `backend/.env`
5. ✅ Variables set correctly: Verify `NEXT_PUBLIC_API_BASE_URL` matches backend port

### Issue: Backend won't start
- Check Python: `python --version`
- Install requirements: `pip install -r requirements.txt`
- Check for errors: Look for traceback in console
- Missing dependencies: Run `pip install -r backend/requirements.txt`

### Issue: CORS error in browser console
- Verify `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000`
- Restart backend after changing CORS_ORIGINS
- Check browser console for exact error message

## Production Deployment

Update these before deploying:
1. **Backend `.env`:**
   - Change `JWT_SECRET_KEY` to a secure random value
   - Update `DATABASE_URL` to production PostgreSQL
   - Set `DEV_RETURN_PASSWORD_RESET_TOKEN=false`
   - Update `CORS_ORIGINS` to production domain

2. **Frontend `.env`:**
   - Change `NEXT_PUBLIC_API_BASE_URL` to production backend URL
   - Update Google OAuth credentials
   - Set appropriate API keys

3. **Docker:**
   - Update ports in `docker-compose.yml` if needed
   - Use environment file: Create `.env` at root for Docker
