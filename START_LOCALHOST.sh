#!/bin/bash

# ============================================
# Ascend - Complete Localhost Startup
# ============================================

set -e

echo "🚀 Starting Ascend on Localhost"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

API_DIR="lesociety/latest/home/node/secret-time-next-api"
FRONTEND_DIR="lesociety/latest/home/node/secret-time-next"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo ""
    echo "Installing Node.js via NVM..."
    ./tmp_rovodev_install_node.sh
    
    # Reload shell environment
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Installation failed. Please install Node.js manually and try again.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
echo ""

# Install API dependencies
echo -e "${BLUE}📦 Installing API dependencies...${NC}"
cd "$API_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ API dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  API dependencies already installed${NC}"
fi
cd - > /dev/null

# Install Frontend dependencies
echo ""
echo -e "${BLUE}📦 Installing Frontend dependencies...${NC}"
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend dependencies already installed${NC}"
fi
cd - > /dev/null

echo ""
echo "===================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "===================================="
echo ""
echo -e "${YELLOW}Starting servers...${NC}"
echo ""

# Start API in background
echo -e "${BLUE}🔧 Starting API server on http://localhost:3001${NC}"
cd "$API_DIR"
npm start > /tmp/lesociety-api.log 2>&1 &
API_PID=$!
echo -e "${GREEN}✅ API started (PID: $API_PID)${NC}"
cd - > /dev/null

# Wait a bit for API to start
sleep 3

# Start Frontend
echo ""
echo -e "${BLUE}🎨 Starting Frontend on http://localhost:3000${NC}"
cd "$FRONTEND_DIR"

echo ""
echo "===================================="
echo -e "${GREEN}🎉 Ascend is Starting!${NC}"
echo "===================================="
echo ""
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}API:${NC}      http://localhost:3001"
echo ""
echo -e "${YELLOW}📝 Press Ctrl+C to stop both servers${NC}"
echo ""

# Trap to kill API on exit
trap "echo ''; echo 'Stopping servers...'; kill $API_PID 2>/dev/null; exit 0" INT TERM

# Start frontend (foreground)
npm run dev
