# Quick Setup Guide

## 1. Install Prerequisites

### System Requirements
- **Node.js 18+** and **npm 9+** (for frontend)
- **Python 3.8+** (for FastAPI backend)
- **MySQL Server** (or access to LuminariMUD database)
- **Git**

### Install Python Dependencies
```bash
cd apps/backend/src
pip install -r requirements.txt
```

## 2. Configure Environment Variables

### Frontend Configuration (`apps/frontend/.env`)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend Configuration (`apps/backend/.env`)
```
# Database Configuration
MYSQL_DATABASE_URL=mysql+pymysql://username:password@localhost/luminari_mudprod

# Server Configuration
PORT=8000
HOST=0.0.0.0

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## 3. Set Up MySQL Database

1. Ensure MySQL server is running with spatial support
2. Connect to your LuminariMUD database (or create test database)
3. Verify the following tables exist with spatial columns:
   - `regions` (with spatial polygon column)
   - `paths` (with spatial linestring column) 
   - `points` (with spatial point column)
4. Test database connectivity

## 4. Run the Application

### Start Frontend (Terminal 1)
```bash
npm run dev:frontend
```

### Start Python Backend (Terminal 2)
```bash
cd apps/backend/src
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/api/health

## 5. Test the Application

1. **Frontend Test**: Open http://localhost:5173 in your browser
2. **Backend Test**: Visit http://localhost:8000/docs for API documentation
3. **Health Check**: Test http://localhost:8000/api/health
4. **Database**: Verify API can connect to MySQL database
5. Check browser console and backend logs for any errors

## Next Steps

Once everything is running:
1. Start using the wilderness editor interface
2. Draw regions, paths, and points on the map
3. Data will be saved directly to the MySQL database
4. Changes will be immediately available in LuminariMUD (if connected to production DB)