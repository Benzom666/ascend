#!/bin/bash

################################################################################
# Production Deployment Script - Ascend
# This script deploys the application to production with all safety checks
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Ascend - Production Deployment${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Configuration
BACKEND_DIR="lesociety/latest/home/node/secret-time-next-api"
FRONTEND_DIR="lesociety/latest/home/node/secret-time-next"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Pre-flight checks
echo -e "${YELLOW}Running pre-flight checks...${NC}"

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "production" ]; then
    echo -e "${RED}ERROR: Not on main or production branch (currently on: $CURRENT_BRANCH)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Branch check passed${NC}"

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}ERROR: You have uncommitted changes${NC}"
    git status -s
    exit 1
fi
echo -e "${GREEN}✓ No uncommitted changes${NC}"

# Check environment files
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}ERROR: Backend .env file not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Environment files exist${NC}"

# Check for strong JWT secrets
JWT_SECRET=$(grep "^JWT_SECRET=" "$BACKEND_DIR/.env" | cut -d'=' -f2)
JWT_SECRET_TOKEN=$(grep "^JWT_SECRET_TOKEN=" "$BACKEND_DIR/.env" | cut -d'=' -f2)

if [[ ${#JWT_SECRET} -lt 50 ]]; then
    echo -e "${RED}ERROR: JWT_SECRET is too weak (less than 50 characters)${NC}"
    exit 1
fi

if [[ ${#JWT_SECRET_TOKEN} -lt 50 ]]; then
    echo -e "${RED}ERROR: JWT_SECRET_TOKEN is too weak (less than 50 characters)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ JWT secrets are strong${NC}"

# Verify ALLOWED_ORIGINS is configured
if ! grep -q "^ALLOWED_ORIGINS=" "$BACKEND_DIR/.env"; then
    echo -e "${YELLOW}WARNING: ALLOWED_ORIGINS not configured in .env${NC}"
    echo -e "${YELLOW}Please configure ALLOWED_ORIGINS before deploying to production${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r "$BACKEND_DIR" "$BACKUP_DIR/backend"
cp -r "$FRONTEND_DIR" "$BACKUP_DIR/frontend"
echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"

# Pull latest code
echo -e "${YELLOW}Pulling latest code...${NC}"
git pull origin $CURRENT_BRANCH
echo -e "${GREEN}✓ Code updated${NC}"

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm ci --production
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd "../../$FRONTEND_DIR"
npm ci --production --legacy-peer-deps
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

# Run database migrations (if any)
echo -e "${YELLOW}Running database migrations...${NC}"
# Add migration commands here if needed
echo -e "${GREEN}✓ Migrations complete${NC}"

# Restart backend
echo -e "${YELLOW}Restarting backend...${NC}"
cd "../../$BACKEND_DIR"
pkill -f "node bin/www" || true
sleep 2
nohup node bin/www > logs/app.log 2>&1 &
echo -e "${GREEN}✓ Backend restarted${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✓ Backend is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}ERROR: Backend failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Restart frontend (if using PM2 or similar)
echo -e "${YELLOW}Restarting frontend...${NC}"
cd "../../$FRONTEND_DIR"
pkill -f "next" || true
sleep 2
nohup npm start > logs/frontend.log 2>&1 &
echo -e "${GREEN}✓ Frontend restarted${NC}"

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
sleep 5

# Check backend health
BACKEND_HEALTH=$(curl -s http://localhost:3001/health | grep -o '"status":"ok"' || echo "failed")
if [ "$BACKEND_HEALTH" == "failed" ]; then
    echo -e "${RED}ERROR: Backend health check failed${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    ./rollback.sh "$BACKUP_DIR"
    exit 1
fi
echo -e "${GREEN}✓ Backend health check passed${NC}"

# Check frontend
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}ERROR: Frontend not responding${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    ./rollback.sh "$BACKUP_DIR"
    exit 1
fi
echo -e "${GREEN}✓ Frontend responding${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Backend: http://localhost:3001"
echo -e "Frontend: http://localhost:3000"
echo -e "Backup: $BACKUP_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Monitor logs: tail -f $BACKEND_DIR/logs/app.log"
echo -e "2. Check error monitoring (Sentry)"
echo -e "3. Verify critical user flows"
echo ""
