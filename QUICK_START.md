# Quick Start Guide

## Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed
- npm or yarn

## Running the Application

### Option 1: Start Both Servers (Recommended for Development)

#### Terminal 1: Start Backend API
```bash
cd backend
python main.py
```
The backend will start on `http://localhost:8000`

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Terminal 2: Start Frontend
```bash
npm run dev
```
The frontend will start on `http://localhost:3000`

### Option 2: Using Docker Compose (All-in-one)
```bash
docker-compose up
```
This will start:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Database: PostgreSQL on port 5432

### Option 3: Using the Batch Script (Windows)
```bash
run_servers.bat
```
This will start both backend and frontend automatically.

## Troubleshooting

### "Failed to fetch" error
- Ensure the backend is running on `http://localhost:8000`
- Check that `NEXT_PUBLIC_API_BASE_URL` in `.env` is set correctly
- Verify no firewall is blocking port 8000

### Backend won't start
- Check Python installation: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check `.env` file in backend directory for required configuration

### Frontend won't start
- Check Node.js installation: `node --version`
- Install dependencies: `npm install`
- Check `.env` in root directory

## API Documentation
Once backend is running, view API docs at: `http://localhost:8000/docs`
