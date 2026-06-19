#!/bin/bash

################################################################################
# Rollback Script - Ascend
# Restores application to a previous backup
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKUP_DIR=${1:-""}

if [ -z "$BACKUP_DIR" ]; then
    echo -e "${RED}ERROR: Backup directory not specified${NC}"
    echo "Usage: ./rollback.sh <backup_directory>"
    echo ""
    echo "Available backups:"
    ls -lt backups/ | head -10
    exit 1
fi

if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}ERROR: Backup directory not found: $BACKUP_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Rolling back to: $BACKUP_DIR${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""

read -p "Are you sure you want to rollback? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

BACKEND_DIR="lesociety/latest/home/node/secret-time-next-api"
FRONTEND_DIR="lesociety/latest/home/node/secret-time-next"

# Stop services
echo -e "${YELLOW}Stopping services...${NC}"
pkill -f "node bin/www" || true
pkill -f "next" || true
sleep 2
echo -e "${GREEN}✓ Services stopped${NC}"

# Restore backend
echo -e "${YELLOW}Restoring backend...${NC}"
rm -rf "$BACKEND_DIR.old" || true
mv "$BACKEND_DIR" "$BACKEND_DIR.old"
cp -r "$BACKUP_DIR/backend" "$BACKEND_DIR"
echo -e "${GREEN}✓ Backend restored${NC}"

# Restore frontend
echo -e "${YELLOW}Restoring frontend...${NC}"
rm -rf "$FRONTEND_DIR.old" || true
mv "$FRONTEND_DIR" "$FRONTEND_DIR.old"
cp -r "$BACKUP_DIR/frontend" "$FRONTEND_DIR"
echo -e "${GREEN}✓ Frontend restored${NC}"

# Restart backend
echo -e "${YELLOW}Restarting backend...${NC}"
cd "$BACKEND_DIR"
nohup node bin/www > logs/app.log 2>&1 &
sleep 3
echo -e "${GREEN}✓ Backend restarted${NC}"

# Restart frontend
echo -e "${YELLOW}Restarting frontend...${NC}"
cd "../../$FRONTEND_DIR"
nohup npm start > logs/frontend.log 2>&1 &
sleep 3
echo -e "${GREEN}✓ Frontend restarted${NC}"

# Verify
echo -e "${YELLOW}Verifying rollback...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend failed to start${NC}"
fi

echo ""
echo -e "${GREEN}Rollback complete!${NC}"
echo ""
