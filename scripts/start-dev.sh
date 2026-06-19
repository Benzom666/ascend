#!/bin/bash

echo "🚀 Starting Ascend Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v)"

# Check if .env files exist
BACKEND_ENV="lesociety/latest/home/node/secret-time-next-api/.env"
FRONTEND_ENV="lesociety/latest/home/node/secret-time-next/.env"

if [ ! -f "$BACKEND_ENV" ]; then
    echo -e "${BLUE}ℹ${NC} Creating backend .env from example..."
    cp "${BACKEND_ENV}.example" "$BACKEND_ENV"
    echo -e "${RED}⚠${NC}  Please edit $BACKEND_ENV with your credentials"
fi

if [ ! -f "$FRONTEND_ENV" ]; then
    echo -e "${BLUE}ℹ${NC} Creating frontend .env from example..."
    cp "${FRONTEND_ENV}.example" "$FRONTEND_ENV"
fi

# Check JWT_SECRET_TOKEN
if ! grep -q "JWT_SECRET_TOKEN=" "$BACKEND_ENV" || grep -q "JWT_SECRET_TOKEN=$" "$BACKEND_ENV"; then
    echo -e "${BLUE}ℹ${NC} Adding JWT_SECRET_TOKEN to backend .env..."
    echo "JWT_SECRET_TOKEN=$(openssl rand -base64 32)" >> "$BACKEND_ENV"
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo -e "${BLUE}→${NC} Backend dependencies..."
cd lesociety/latest/home/node/secret-time-next-api
npm install --silent
cd ../../../../

# Install frontend dependencies
echo -e "${BLUE}→${NC} Frontend dependencies..."
cd lesociety/latest/home/node/secret-time-next
npm install --silent
cd ../../../

echo ""
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Test database connection
echo "🗄️  Testing database connection..."
if node check-user.js &> /dev/null; then
    echo -e "${GREEN}✓${NC} Database connected"
else
    echo -e "${RED}⚠${NC}  Database connection failed - please check your MONGO_URI in .env"
fi

echo ""
echo "🎯 Starting services..."
echo ""

# Kill any existing processes
pkill -f "node bin/www" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start backend
echo -e "${BLUE}→${NC} Starting backend on port 3001..."
cd lesociety/latest/home/node/secret-time-next-api
node bin/www > ../../../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../../../../

sleep 3

# Check if backend started
if curl -sf http://localhost:3001/api/v1/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend running (PID: $BACKEND_PID)"
else
    echo -e "${RED}❌ Backend failed to start - check logs/backend.log${NC}"
    exit 1
fi

# Start frontend
echo -e "${BLUE}→${NC} Starting frontend on port 3000..."
cd lesociety/latest/home/node/secret-time-next
npm run dev > ../../../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../../../

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}✨ Ascend is running!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001/api/v1"
echo ""
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "Test credentials:"
echo "  Email:    afro@yopmail.com"
echo "  Password: 123456"
echo ""
echo "To stop: pkill -f node"
echo "Logs: tail -f logs/*.log"
echo ""
echo "═══════════════════════════════════════════════════════"
