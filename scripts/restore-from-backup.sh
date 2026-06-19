#!/bin/bash

################################################################################
# Database Restore Script - Ascend
# Restores MongoDB from backup
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKUP_DIR="database/backups"
ENV_FILE="lesociety/latest/home/node/secret-time-next-api/.env"
BACKUP_FILE=${1:-""}

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}MongoDB Restore - Ascend${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if backup file specified
if [ -z "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lht "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -10 | awk '{print $9, "("$5")", $6, $7, $8}'
    echo ""
    echo -e "${RED}Usage: ./restore-from-backup.sh <backup_file.tar.gz>${NC}"
    echo -e "Example: ./restore-from-backup.sh database/backups/lesociety_backup_20260403_170000.tar.gz"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}ERROR: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Confirm restore
echo -e "${YELLOW}⚠️  WARNING: This will restore the database from:${NC}"
echo -e "   $BACKUP_FILE"
echo ""
echo -e "${RED}This will OVERWRITE the current database!${NC}"
read -p "Are you sure? Type 'YES' to continue: " -r
echo
if [ "$REPLY" != "YES" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Load environment variables
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}ERROR: .env file not found${NC}"
    exit 1
fi

export MONGO_USER=$(grep "^MONGO_USER=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
export MONGO_PASS=$(grep "^MONGO_PASS=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
export MONGO_HOST=$(grep "^MONGO_HOST=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
export DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")

# Extract backup
TEMP_DIR="/tmp/lesociety_restore_$$"
mkdir -p "$TEMP_DIR"
echo -e "${YELLOW}Extracting backup...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory (it's the only directory in the temp dir)
BACKUP_EXTRACT_DIR=$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d)

if [ -z "$BACKUP_EXTRACT_DIR" ]; then
    echo -e "${RED}ERROR: Could not find backup data${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Construct MongoDB URI
MONGO_URI="mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${DB_NAME}?retryWrites=true&w=majority"

# Perform restore
echo -e "${YELLOW}Restoring database...${NC}"
mongorestore \
    --uri="$MONGO_URI" \
    --drop \
    --gzip \
    "$BACKUP_EXTRACT_DIR/$DB_NAME" \
    2>&1 | grep -v "password"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
    
    # Clean up
    rm -rf "$TEMP_DIR"
    
    echo ""
    echo -e "${GREEN}Restore complete!${NC}"
    echo -e "Database: $DB_NAME"
    echo -e "From: $BACKUP_FILE"
else
    echo -e "${RED}✗ Restore failed${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi
