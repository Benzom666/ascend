#!/bin/bash

################################################################################
# Database Backup Script - Ascend
# Creates MongoDB backups with retention policy
################################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BACKUP_DIR="database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="lesociety_backup_${TIMESTAMP}"
ENV_FILE="lesociety/latest/home/node/secret-time-next-api/.env"
RETENTION_DAYS=30

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}MongoDB Backup - Ascend${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Load environment variables
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}ERROR: .env file not found${NC}"
    exit 1
fi

# Extract MongoDB credentials
export MONGO_USER=$(grep "^MONGO_USER=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
export MONGO_PASS=$(grep "^MONGO_PASS=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
export MONGO_HOST=$(grep "^MONGO_HOST=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
export DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$MONGO_USER" ] || [ -z "$MONGO_PASS" ] || [ -z "$MONGO_HOST" ]; then
    echo -e "${RED}ERROR: MongoDB credentials not found in .env${NC}"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

echo -e "${YELLOW}Backing up database: $DB_NAME${NC}"
echo -e "Host: $MONGO_HOST"
echo -e "Backup location: $BACKUP_DIR/$BACKUP_NAME"
echo ""

# Construct MongoDB URI
MONGO_URI="mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${DB_NAME}?retryWrites=true&w=majority"

# Perform backup using mongodump
echo -e "${YELLOW}Running mongodump...${NC}"
mongodump \
    --uri="$MONGO_URI" \
    --out="$BACKUP_DIR/$BACKUP_NAME" \
    --gzip \
    2>&1 | grep -v "password"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    
    # Create backup metadata
    cat > "$BACKUP_DIR/$BACKUP_NAME/backup_info.txt" << EOF
Backup Date: $(date)
Database: $DB_NAME
Host: $MONGO_HOST
MongoDB Version: $(mongodump --version | head -1)
Backup Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
EOF
    
    # Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    FINAL_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
    echo -e "${GREEN}✓ Backup compressed: ${FINAL_SIZE}${NC}"
    
    # Clean up old backups
    echo -e "${YELLOW}Cleaning up old backups (keeping last ${RETENTION_DAYS} days)...${NC}"
    find "$BACKUP_DIR" -name "lesociety_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "lesociety_backup_*.tar.gz" | wc -l)
    echo -e "${GREEN}✓ Retained backups: ${REMAINING_BACKUPS}${NC}"
    
    echo ""
    echo -e "${GREEN}Backup Summary:${NC}"
    echo -e "File: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    echo -e "Size: ${FINAL_SIZE}"
    echo -e "Total backups: ${REMAINING_BACKUPS}"
    
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Backup complete!${NC}"
