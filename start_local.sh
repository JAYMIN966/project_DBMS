#!/bin/bash

# Sports Registration System - Local Startup Script
# This script helps you start both backend and frontend servers

echo "========================================"
echo "Sports Registration System - Local Setup"
echo "========================================"
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
psql -U postgres -d Councours_new -c "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot connect to PostgreSQL database 'Councours_new'"
    echo "Please ensure:"
    echo "  1. PostgreSQL is running"
    echo "  2. Database 'Councours_new' exists"
    echo "  3. User 'postgres' has correct password"
    echo ""
    echo "To create the database, run:"
    echo "  psql -U postgres -c 'CREATE DATABASE Councours_new;'"
    echo "  psql -U postgres -d Councours_new -f database_init.sql"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL connection successful"
echo ""

# Start backend in background
echo "Starting backend server on port 8001..."
cd backend
python3 -m pip install -r requirements.txt --quiet
uvicorn server:app --host 0.0.0.0 --port 8001 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Log file: backend.log"
echo ""

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on port 3000..."
cd ../frontend
yarn install --silent > /dev/null 2>&1
echo "✅ Frontend dependencies installed"
echo ""

echo "========================================"
echo "Starting frontend (this will open browser)..."
echo "========================================"
echo ""
echo "📝 Credentials:"
echo "   Admin Username: admin"
echo "   Admin Password: admin123"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo "To stop servers:"
echo "   Press Ctrl+C in this terminal"
echo "   Or kill backend process: kill $BACKEND_PID"
echo ""

# Start frontend (this will block)
yarn start
