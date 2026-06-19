#!/bin/bash

################################################################################
# Production Startup Script - Ascend
# Safely starts the application with all checks
################################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_DIR="lesociety/latest/home/node/secret-time-next-api"
FRONTEND_DIR="lesociety/latest/home/node/secret-time-next"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Ascend - Production Startup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Step 1: Validate environment
echo -e "${YELLOW}Step 1: Validating environment...${NC}"
if [ -f "./validate-environment.sh" ]; then
    ./validate-environment.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}Environment validation failed. Fix errors before starting.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Warning: validate-environment.sh not found${NC}"
fi
echo ""

# Step 2: Check if services are already running
echo -e "${YELLOW}Step 2: Checking for running services...${NC}"
if pgrep -f "node bin/www" > /dev/null; then
    echo -e "${YELLOW}Backend is already running${NC}"
    read -p "Stop and restart? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "node bin/www"
        sleep 2
        echo -e "${GREEN}✓ Stopped backend${NC}"
    else
        echo "Keeping existing backend running"
        SKIP_BACKEND=true
    fi
fi

if pgrep -f "next-server\|next start" > /dev/null; then
    echo -e "${YELLOW}Frontend is already running${NC}"
    read -p "Stop and restart? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "next-server\|next start"
        sleep 2
        echo -e "${GREEN}✓ Stopped frontend${NC}"
    else
        echo "Keeping existing frontend running"
        SKIP_FRONTEND=true
    fi
fi
echo ""

# Step 3: Create necessary directories
echo -e "${YELLOW}Step 3: Creating directories...${NC}"
mkdir -p "$BACKEND_DIR/logs"
mkdir -p "$FRONTEND_DIR/logs"
mkdir -p "database/backups"
echo -e "${GREEN}✓ Directories ready${NC}"
echo ""

# Step 4: Check database connection
echo -e "${YELLOW}Step 4: Testing database connection...${NC}"
cd v2
if node check-user.js 2>&1 | grep -q "Connected\|found"; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo -e "${YELLOW}Check your MongoDB credentials in .env${NC}"
    exit 1
fi
cd ..
echo ""

# Step 5: Start backend
if [ "$SKIP_BACKEND" != true ]; then
    echo -e "${YELLOW}Step 5: Starting backend...${NC}"
    cd "$BACKEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        npm ci --production
    fi
    
    # Start backend in background
    NODE_ENV=${NODE_ENV:-production} nohup node bin/www > logs/app_$(date +%Y%m%d).log 2>&1 &
    BACKEND_PID=$!
    
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    
    # Wait for backend to be ready
    echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend is healthy${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}✗ Backend failed to start${NC}"
            echo -e "${YELLOW}Check logs: tail -f $BACKEND_DIR/logs/app_$(date +%Y%m%d).log${NC}"
            exit 1
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    cd ../..
else
    echo -e "${YELLOW}Step 5: Skipping backend (already running)${NC}"
    echo ""
fi

# Step 6: Start frontend
if [ "$SKIP_FRONTEND" != true ]; then
    echo -e "${YELLOW}Step 6: Starting frontend...${NC}"
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm ci --legacy-peer-deps
    fi
    
    # Check if build exists
    if [ ! -d ".next" ]; then
        echo -e "${YELLOW}Building frontend...${NC}"
        npm run build
    fi
    
    # Start frontend in background
    NODE_ENV=production nohup npm start > logs/frontend_$(date +%Y%m%d).log 2>&1 &
    FRONTEND_PID=$!
    
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    
    # Wait for frontend to be ready
    echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
    sleep 5
    for i in {1..20}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Frontend is ready${NC}"
            break
        fi
        if [ $i -eq 20 ]; then
            echo -e "${YELLOW}⚠ Frontend may still be starting${NC}"
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    cd ../..
else
    echo -e "${YELLOW}Step 6: Skipping frontend (already running)${NC}"
    echo ""
fi

# Step 7: Final health check
echo -e "${YELLOW}Step 7: Final health check...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓ All systems operational${NC}"
else
    echo -e "${RED}⚠ Health check returned unexpected response${NC}"
fi
echo ""

# Display status
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Startup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Backend:  http://localhost:3001"
echo -e "Frontend: http://localhost:3000"
echo ""
echo -e "📊 Monitor with:"
echo -e "  Backend logs:  tail -f $BACKEND_DIR/logs/app_$(date +%Y%m%d).log"
echo -e "  Frontend logs: tail -f $FRONTEND_DIR/logs/frontend_$(date +%Y%m%d).log"
echo ""
echo -e "🔍 Check health:  curl http://localhost:3001/health"
echo -e "🛑 Stop services: pkill -f 'node bin/www' && pkill -f 'next'"
echo ""
echo -e "${GREEN}Ready for production! 🚀${NC}"
