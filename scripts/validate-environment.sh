#!/bin/bash

################################################################################
# Environment Validation Script - Ascend
# Validates all required environment variables are set correctly
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_ENV="lesociety/latest/home/node/secret-time-next-api/.env"
FRONTEND_ENV="lesociety/latest/home/node/secret-time-next/.env"
ERRORS=0
WARNINGS=0

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Environment Validation${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if .env files exist
if [ ! -f "$BACKEND_ENV" ]; then
    echo -e "${RED}✗ FATAL: Backend .env file not found${NC}"
    exit 1
fi

if [ ! -f "$FRONTEND_ENV" ]; then
    echo -e "${YELLOW}⚠ WARNING: Frontend .env file not found${NC}"
    ((WARNINGS++))
fi

echo -e "${YELLOW}Validating Backend Environment...${NC}"
echo ""

# Function to check required variable
check_required() {
    local var_name=$1
    local min_length=${2:-1}
    local value=$(grep "^${var_name}=" "$BACKEND_ENV" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    
    if [ -z "$value" ]; then
        echo -e "${RED}✗ MISSING: $var_name${NC}"
        ((ERRORS++))
        return 1
    elif [ ${#value} -lt $min_length ]; then
        echo -e "${RED}✗ TOO SHORT: $var_name (${#value} chars, need $min_length)${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✓ VALID: $var_name${NC}"
        return 0
    fi
}

# Function to check optional variable
check_optional() {
    local var_name=$1
    local value=$(grep "^${var_name}=" "$BACKEND_ENV" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}⚠ NOT SET: $var_name (optional)${NC}"
        ((WARNINGS++))
        return 1
    else
        echo -e "${GREEN}✓ SET: $var_name${NC}"
        return 0
    fi
}

# Function to check for placeholder values
check_not_placeholder() {
    local var_name=$1
    local value=$(grep "^${var_name}=" "$BACKEND_ENV" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    
    if echo "$value" | grep -iq "your\|replace\|change\|placeholder\|example\|test"; then
        echo -e "${RED}✗ PLACEHOLDER: $var_name contains placeholder value!${NC}"
        ((ERRORS++))
        return 1
    fi
    return 0
}

echo "=== Critical Security Variables ==="
check_required "JWT_SECRET" 50
check_not_placeholder "JWT_SECRET"
check_required "JWT_SECRET_TOKEN" 50
check_not_placeholder "JWT_SECRET_TOKEN"
echo ""

echo "=== Database Configuration ==="
check_required "MONGO_USER" 3
check_required "MONGO_PASS" 8
check_required "MONGO_HOST" 10
check_required "DB_NAME" 3
check_required "MONGO_MAX_POOL_SIZE" 1
check_required "MONGO_MIN_POOL_SIZE" 1
echo ""

echo "=== Application Settings ==="
check_required "NODE_ENV" 3
check_required "PORT" 4
echo ""

echo "=== CORS Configuration ==="
check_required "ALLOWED_ORIGINS" 10
check_not_placeholder "ALLOWED_ORIGINS"
echo ""

echo "=== File Storage (Supabase) ==="
if check_optional "SUPABASE_URL"; then
    check_not_placeholder "SUPABASE_URL"
    check_optional "SUPABASE_SERVICE_ROLE_KEY"
    check_optional "SUPABASE_STORAGE_BUCKET"
fi
echo ""

echo "=== Error Monitoring (Sentry) ==="
if check_optional "SENTRY_DSN"; then
    check_optional "SENTRY_ENVIRONMENT"
fi
echo ""

echo "=== Redis (Caching & Rate Limiting) ==="
check_optional "REDIS_URL"
echo ""

echo "=== Email Configuration ==="
check_optional "MAIL_HOST"
check_optional "MAIL_PORT"
check_optional "MAIL_USER"
echo ""

# Check NODE_ENV value
echo "=== Environment Mode Check ==="
NODE_ENV=$(grep "^NODE_ENV=" "$BACKEND_ENV" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${GREEN}✓ Running in PRODUCTION mode${NC}"
    
    # Extra strict checks for production
    if grep -q "localhost" "$BACKEND_ENV"; then
        echo -e "${YELLOW}⚠ WARNING: Found 'localhost' in production .env${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "127.0.0.1" "$BACKEND_ENV"; then
        echo -e "${YELLOW}⚠ WARNING: Found '127.0.0.1' in production .env${NC}"
        ((WARNINGS++))
    fi
elif [ "$NODE_ENV" = "development" ]; then
    echo -e "${YELLOW}ℹ Running in DEVELOPMENT mode${NC}"
else
    echo -e "${RED}✗ Invalid NODE_ENV: $NODE_ENV${NC}"
    ((ERRORS++))
fi
echo ""

# Check for common security issues
echo "=== Security Audit ==="

# Check if .env is in .gitignore
if git check-ignore "$BACKEND_ENV" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ .env is properly ignored by git${NC}"
else
    echo -e "${RED}✗ CRITICAL: .env is NOT in .gitignore!${NC}"
    ((ERRORS++))
fi

# Check if JWT secrets are strong enough
JWT_SECRET_LEN=$(grep "^JWT_SECRET=" "$BACKEND_ENV" | wc -c)
if [ $JWT_SECRET_LEN -gt 70 ]; then
    echo -e "${GREEN}✓ JWT_SECRET is strong (${JWT_SECRET_LEN} chars)${NC}"
else
    echo -e "${RED}✗ JWT_SECRET is weak (only ${JWT_SECRET_LEN} chars)${NC}"
    ((ERRORS++))
fi

# Check for hardcoded passwords
if grep -E "(password|pass|pwd).*=.*(admin|test|12345|password)" "$BACKEND_ENV" > /dev/null 2>&1; then
    echo -e "${RED}✗ Found weak/test password in .env${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ No obvious weak passwords found${NC}"
fi

echo ""

# Frontend validation
if [ -f "$FRONTEND_ENV" ]; then
    echo -e "${YELLOW}Validating Frontend Environment...${NC}"
    echo ""
    
    FRONTEND_API_URL=$(grep "^NEXT_PUBLIC_API_URL=" "$FRONTEND_ENV" 2>/dev/null | cut -d'=' -f2)
    
    if [ -z "$FRONTEND_API_URL" ]; then
        echo -e "${RED}✗ NEXT_PUBLIC_API_URL not set${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓ NEXT_PUBLIC_API_URL is set${NC}"
    fi
    
    if [ "$NODE_ENV" = "production" ]; then
        if echo "$FRONTEND_API_URL" | grep -q "localhost"; then
            echo -e "${RED}✗ Frontend API URL points to localhost in production!${NC}"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ Frontend API URL is production-ready${NC}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Validation Summary${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ PASSED - Environment is valid!${NC}"
    exit 0
else
    echo -e "${RED}❌ FAILED - Fix errors before deploying!${NC}"
    exit 1
fi
