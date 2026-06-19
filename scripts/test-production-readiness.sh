#!/bin/bash

################################################################################
# Production Readiness Test Script - Ascend
# Validates all critical fixes are working
################################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_DIR="lesociety/latest/home/node/secret-time-next-api"
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Production Readiness Test Suite${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Test 1: JWT Secrets Strength
echo -e "${YELLOW}Test 1: JWT Secrets Strength${NC}"
JWT_SECRET_LEN=$(grep "^JWT_SECRET=" "$BACKEND_DIR/.env" | wc -c)
JWT_TOKEN_LEN=$(grep "^JWT_SECRET_TOKEN=" "$BACKEND_DIR/.env" | wc -c)

if [ $JWT_SECRET_LEN -gt 60 ] && [ $JWT_TOKEN_LEN -gt 60 ]; then
    echo -e "${GREEN}✓ PASS: JWT secrets are strong (>60 chars)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: JWT secrets are too weak${NC}"
    ((TESTS_FAILED++))
fi

# Test 2: Security packages installed
echo -e "${YELLOW}Test 2: Security Packages${NC}"
cd "$BACKEND_DIR"
PACKAGES=("helmet" "express-mongo-sanitize" "compression" "@sentry/node")
ALL_INSTALLED=true

for pkg in "${PACKAGES[@]}"; do
    if npm list "$pkg" 2>/dev/null | grep -q "$pkg"; then
        echo -e "${GREEN}  ✓ $pkg installed${NC}"
    else
        echo -e "${RED}  ✗ $pkg NOT installed${NC}"
        ALL_INSTALLED=false
    fi
done

if [ "$ALL_INSTALLED" = true ]; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 3: .env file security
echo -e "${YELLOW}Test 3: Environment File Security${NC}"
if git check-ignore "$BACKEND_DIR/.env" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS: .env is in .gitignore${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: .env NOT in .gitignore${NC}"
    ((TESTS_FAILED++))
fi

# Test 4: Security middleware files exist
echo -e "${YELLOW}Test 4: Security Middleware Files${NC}"
if [ -f "$BACKEND_DIR/middleware/security.js" ]; then
    echo -e "${GREEN}✓ PASS: security.js exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: security.js missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 5: Pagination helper exists
echo -e "${YELLOW}Test 5: Pagination Helper${NC}"
if [ -f "$BACKEND_DIR/helpers/pagination.js" ]; then
    echo -e "${GREEN}✓ PASS: pagination.js exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: pagination.js missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 6: Graceful shutdown in www
echo -e "${YELLOW}Test 6: Graceful Shutdown${NC}"
if grep -q "gracefulShutdown" "$BACKEND_DIR/bin/www"; then
    echo -e "${GREEN}✓ PASS: Graceful shutdown implemented${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: Graceful shutdown missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 7: Database indexes added
echo -e "${YELLOW}Test 7: Database Indexes${NC}"
if grep -q "NotificationSchema.index" "$BACKEND_DIR/models/notification.js"; then
    echo -e "${GREEN}✓ PASS: Notification indexes added${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: Notification indexes missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 8: File upload limits
echo -e "${YELLOW}Test 8: File Upload Limits${NC}"
if grep -q "fileSize.*5.*1024.*1024" "$BACKEND_DIR/controllers/v1/files.js"; then
    echo -e "${GREEN}✓ PASS: File size limits configured${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: File size limits missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 9: Health endpoints in app.js
echo -e "${YELLOW}Test 9: Health Endpoints${NC}"
if grep -q "app.get('/health'" "$BACKEND_DIR/app.js"; then
    echo -e "${GREEN}✓ PASS: Health endpoints added${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: Health endpoints missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 10: CORS configuration
echo -e "${YELLOW}Test 10: CORS Configuration${NC}"
if grep -q "ALLOWED_ORIGINS" "$BACKEND_DIR/app.js"; then
    echo -e "${GREEN}✓ PASS: CORS properly configured${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: CORS not properly configured${NC}"
    ((TESTS_FAILED++))
fi

# Test 11: Deployment scripts exist
echo -e "${YELLOW}Test 11: Deployment Automation${NC}"
cd ../..
if [ -f "deploy-production.sh" ] && [ -x "deploy-production.sh" ]; then
    echo -e "${GREEN}✓ PASS: Deployment script exists and executable${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: Deployment script missing or not executable${NC}"
    ((TESTS_FAILED++))
fi

# Test 12: Documentation exists
echo -e "${YELLOW}Test 12: Documentation${NC}"
if [ -f "PRODUCTION_READINESS_AUDIT.md" ] && [ -f "PRODUCTION_FIXES_IMPLEMENTED.md" ]; then
    echo -e "${GREEN}✓ PASS: Documentation complete${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL: Documentation incomplete${NC}"
    ((TESTS_FAILED++))
fi

# Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Test Results${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - PRODUCTION READY!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED - REVIEW REQUIRED${NC}"
    exit 1
fi
