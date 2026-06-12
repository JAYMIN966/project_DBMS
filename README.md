# Sports Registration System

A full-stack web application for managing player registrations and sports selections with PostgreSQL database integration.

![Sports Registration System](https://img.shields.io/badge/FastAPI-PostgreSQL-blue)
![React](https://img.shields.io/badge/React-19.0-61DAFB)
![Python](https://img.shields.io/badge/Python-3.11-3776AB)

## Overview

This system allows players to register with their details and select multiple sports. Administrators can manage the available sports options. The application features a clean, modern UI with sequential player ID generation and complete CRUD operations.

## Features

### Player Features
- ✅ **Player Registration**: Register with name, age, and email (mandatory)
- ✅ **Multi-Sport Selection**: Choose one or more sports during registration
- ✅ **Edit Profile**: Update player information and sport selections
- ✅ **Delete Registration**: Remove player from the system
- ✅ **Auto-Generated Player ID**: Sequential IDs (P0001, P0002, etc.)
- ✅ **Email Validation**: Ensures valid email format

### Admin Features
- ✅ **Secure Login**: Admin authentication with JWT
  - Username: `admin`
  - Password: `admin123`
- ✅ **Add Sports**: Create new sport options
- ✅ **Delete Sports**: Remove sports (cascading delete from player associations)
- ✅ **Sports Management Dashboard**: View all available sports

### Technical Features
- ✅ **PostgreSQL Integration**: Full database integration with proper relationships
- ✅ **RESTful API**: Well-structured API endpoints
- ✅ **Modern UI**: Clean, minimal design with gradient accents
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Real-time Updates**: Instant UI updates after operations
- ✅ **Error Handling**: Proper error messages and validation

## Tech Stack

### Frontend
- **React 19.0**: Modern UI framework
- **TailwindCSS**: Utility-first styling
- **Shadcn UI**: Beautiful, accessible components
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing
- **Lucide Icons**: Modern icon library
- **Sonner**: Toast notifications

### Backend
- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Relational database
- **psycopg2**: PostgreSQL adapter for Python
- **Pydantic**: Data validation
- **JWT**: JSON Web Tokens for authentication
- **CORS Middleware**: Cross-origin resource sharing

## Database Schema

```sql
-- Player table
player (
    player_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL
)

-- Sports table
sports (
    sports_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
)

-- Player email table (composite PK)
player_email (
    player_id VARCHAR(50),
    email VARCHAR(255),
    PRIMARY KEY (player_id, email),
    FOREIGN KEY (player_id) REFERENCES player(player_id)
)

-- Player sports relationship (composite PK)
player_sports (
    player_id VARCHAR(50),
    sports_id INTEGER,
    PRIMARY KEY (player_id, sports_id),
    FOREIGN KEY (player_id) REFERENCES player(player_id),
    FOREIGN KEY (sports_id) REFERENCES sports(sports_id)
)
```

## Getting Started

### Prerequisites
- PostgreSQL (installed and running)
- Python 3.8+
- Node.js 14+
- npm or yarn

### Database Setup

1. **Create Database:**
   ```bash
   psql -U postgres
   CREATE DATABASE Councours_new;
   \q
   ```

2. **Initialize Tables:**
   ```bash
   psql -U postgres -d Councours_new -f database_init.sql
   ```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment (backend/.env):**
   ```env
   PG_HOST=localhost
   PG_DATABASE=Councours_new
   PG_USER=postgres
   PG_PASSWORD=Jaymin@2006
   PG_PORT=5432
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. **Start backend server:**
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

   Backend runs at: `http://localhost:8001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Configure environment (frontend/.env):**
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

4. **Start frontend development server:**
   ```bash
   yarn start
   # or
   npm start
   ```

   Frontend opens at: `http://localhost:3000`

## Usage Guide

### For Players

1. **Register:**
   - Click "Register New Player"
   - Enter name, age, and email
   - Select one or more sports
   - Click "Register Player"

2. **View Registrations:**
   - All registered players appear as cards
   - Each card shows player ID, name, age, email, and sports

3. **Edit Registration:**
   - Click "Edit" on any player card
   - Modify details and sports selection
   - Click "Update Player"

4. **Delete Registration:**
   - Click "Delete" on any player card
   - Confirm deletion

### For Admin

1. **Login:**
   - Click "Admin Panel"
   - Enter credentials (admin/admin123)
   - Click "Login"

2. **Manage Sports:**
   - View all available sports
   - Click "Add Sport" to create new sport
   - Click "Delete" to remove a sport

3. **Logout:**
   - Click "Logout" to end session

## API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sports` | Get all sports |
| GET | `/api/players` | Get all players |
| GET | `/api/players/{id}` | Get specific player |
| POST | `/api/players` | Register new player |
| PUT | `/api/players/{id}` | Update player |
| DELETE | `/api/players/{id}` | Delete player |

### Admin Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/sports` | Add new sport |
| DELETE | `/api/admin/sports/{id}` | Delete sport |

### Request/Response Examples

**Register Player:**
```json
POST /api/players
{
  "name": "John Doe",
  "age": 25,
  "email": "john@example.com",
  "sports_ids": [1, 3, 5]
}

Response: 
{
  "player_id": "P0001",
  "name": "John Doe",
  "age": 25,
  "email": "john@example.com",
  "sports": [
    {"sports_id": 1, "name": "Football"},
    {"sports_id": 3, "name": "Tennis"},
    {"sports_id": 5, "name": "Swimming"}
  ]
}
```

**Admin Login:**
```json
POST /api/admin/login
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "admin"
}
```

## Project Structure

```
sports-registration-system/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Global styles
│   │   ├── index.js       # Entry point
│   │   ├── pages/
│   │   │   ├── HomePage.js    # Player registration page
│   │   │   └── AdminPage.js   # Admin dashboard
│   │   └── components/
│   │       └── ui/        # Shadcn UI components
│   ├── package.json       # Node dependencies
│   └── .env              # Environment variables
├── database_init.sql      # Database initialization script
├── DEPLOYMENT_INSTRUCTIONS.md
└── README.md
```

## Design Highlights

- **Color Scheme**: Blue-to-cyan gradients for main actions, purple-to-pink for admin
- **Typography**: Space Grotesk for headings, Inter for body text
- **Layout**: Clean cards with hover effects and shadows
- **Interactions**: Smooth transitions and toast notifications
- **Icons**: Lucide React icons for visual clarity
- **Responsive**: Mobile-first design with TailwindCSS

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Verify credentials in `backend/.env`
- Check if database exists: `psql -U postgres -l`

### Backend Won't Start
- Check if port 8001 is available: `lsof -i :8001`
- Verify all dependencies installed: `pip list`
- Check logs for specific errors

### Frontend Can't Connect to Backend
- Ensure backend is running at `http://localhost:8001`
- Verify `REACT_APP_BACKEND_URL` in `frontend/.env`
- Check browser console for CORS errors

### Import Errors
- Run `pip install -r requirements.txt` in backend
- Run `yarn install` or `npm install` in frontend
- Clear node_modules and reinstall if needed

## Security Notes

⚠️ **For Production Deployment:**
- Change admin credentials in `.env`
- Use strong `SECRET_KEY` for JWT
- Enable HTTPS
- Implement rate limiting
- Add input sanitization
- Use prepared statements (already implemented)
- Enable PostgreSQL SSL connections
- Set proper CORS origins (not `*`)


---

**Built with ❤️ using React, FastAPI, and PostgreSQL**
