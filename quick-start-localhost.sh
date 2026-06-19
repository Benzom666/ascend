#!/bin/bash

# ============================================
# Ascend - Quick Localhost Setup
# ============================================

set -e

echo "🚀 Ascend Quick Start for Localhost Testing"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
FRONTEND_DIR="lesociety/latest/home/node/secret-time-next"
API_DIR="lesociety/latest/home/node/secret-time-next-api"

# Step 1: Check Node.js
echo "📦 Step 1: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo ""
    echo "Please install Node.js first:"
    echo "  - Visit: https://nodejs.org/ (recommended: LTS version)"
    echo "  - Or use nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  - Then run: nvm install 16 && nvm use 16"
    exit 1
else
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
    echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
fi

# Step 2: Create .env files
echo ""
echo "🔧 Step 2: Setting up environment files..."

# Frontend .env
if [ ! -f "$FRONTEND_DIR/.env" ]; then
    echo "Creating frontend .env file..."
    cat > "$FRONTEND_DIR/.env" << 'EOF'
# Ascend Frontend - Development Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_ENV=development
EOF
    echo -e "${GREEN}✅ Created $FRONTEND_DIR/.env${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env already exists, skipping...${NC}"
fi

# API .env
if [ ! -f "$API_DIR/.env" ]; then
    echo "Creating API .env file with minimal config..."
    
    # Generate JWT secrets
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
    JWT_SECRET_TOKEN=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
    
    cat > "$API_DIR/.env" << EOF
# Ascend API - Development Configuration
# ============================================

# MongoDB Configuration
MONGO_USER=your_mongodb_username
MONGO_PASS=your_mongodb_password
MONGO_HOST=your-cluster.mongodb.net
DB_NAME=lesociety

# Application
APP_URL=http://localhost:3001
NODE_ENV=development
PORT=3001

# JWT Secrets (auto-generated)
JWT_SECRET=$JWT_SECRET
JWT_SECRET_TOKEN=$JWT_SECRET_TOKEN
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email (placeholder - optional for local testing)
MAIL_FROM=noreply@lesociety.com

# Logging
LOG_LEVEL=info
ENABLE_CONSOLE_LOG=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo -e "${GREEN}✅ Created $API_DIR/.env${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: You need to update MongoDB credentials in $API_DIR/.env${NC}"
else
    echo -e "${YELLOW}⚠️  API .env already exists, skipping...${NC}"
fi

# Step 3: Install dependencies
echo ""
echo "📚 Step 3: Installing dependencies..."

echo "Installing API dependencies..."
cd "$API_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ API dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  API node_modules exists, skipping install...${NC}"
fi

cd - > /dev/null

echo "Installing Frontend dependencies..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend node_modules exists, skipping install...${NC}"
fi

cd - > /dev/null

# Step 4: Instructions
echo ""
echo "============================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "============================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure MongoDB credentials:"
echo "   Edit: $API_DIR/.env"
echo "   Update: MONGO_USER, MONGO_PASS, MONGO_HOST"
echo ""
echo "2. Start the API server (Terminal 1):"
echo "   cd $API_DIR"
echo "   npm start"
echo ""
echo "3. Start the Frontend (Terminal 2):"
echo "   cd $FRONTEND_DIR"
echo "   npm run dev"
echo ""
echo "4. Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:3001"
echo ""
echo "============================================"
echo -e "${YELLOW}💡 Quick Start Command:${NC}"
echo ""
echo "Run both servers in one command:"
echo "  # In one terminal:"
echo "  cd $API_DIR && npm start &"
echo "  cd $FRONTEND_DIR && npm run dev"
echo ""
echo "============================================"
