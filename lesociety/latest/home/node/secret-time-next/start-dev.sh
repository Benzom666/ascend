#!/bin/bash

# Secret Time - Startup Script
# This script ensures proper startup order and cleanup

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$PROJECT_DIR/lesociety/latest/home/node/secret-time-next-api"
FRONTEND_DIR="$PROJECT_DIR/lesociety/latest/home/node/secret-time-next"
BACKEND_PID_FILE="/tmp/secret-time-backend.pid"
FRONTEND_PID_FILE="/tmp/secret-time-frontend.pid"

echo "🚀 Starting Secret Time development environment..."
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."

    # Kill frontend
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p $FRONTEND_PID > /dev/null; then
            echo "  Stopping frontend (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID 2>/dev/null
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    # Kill backend
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if ps -p $BACKEND_PID > /dev/null; then
            echo "  Stopping backend (PID: $BACKEND_PID)..."
            kill $BACKEND_PID 2>/dev/null
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    # Kill any orphaned node processes on our ports
    fuser -k 3000/tcp 2>/dev/null
    fuser -k 3001/tcp 2>/dev/null

    echo "✅ Cleanup complete"
    exit 0
}

# Set trap for cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Kill any existing processes on our ports
echo "🧹 Cleaning up any existing processes..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 2

# Start Backend
echo "📡 Starting backend server..."
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  ⚠️  Backend dependencies not found, installing..."
    npm install
fi

# Start backend in background with logging
nohup node bin/www > /tmp/secret-time-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$BACKEND_PID_FILE"
echo "  Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "  ⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/v1/ > /dev/null 2>&1; then
        echo "  ✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "  ❌ Backend failed to start! Check logs: tail -f /tmp/secret-time-backend.log"
        cleanup
        exit 1
    fi
    sleep 1
done

# Start Frontend
echo ""
echo "🎨 Starting frontend server..."
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  ⚠️  Frontend dependencies not found, installing..."
    npm install
fi

# Clean Next.js cache for reliable startups
echo "  🧹 Cleaning Next.js cache..."
rm -rf .next

# Start frontend with Node.js compatibility flag
NODE_OPTIONS=--openssl-legacy-provider nohup npm run dev > /tmp/secret-time-frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
echo "  Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to be ready
echo "  ⏳ Waiting for frontend to be ready..."
for i in {1..45}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "  ✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 45 ]; then
        echo "  ❌ Frontend failed to start! Check logs: tail -f /tmp/secret-time-frontend.log"
        cleanup
        exit 1
    fi
    sleep 2
done

# Start Cloudflare Tunnel (optional)
echo ""
echo "🌐 Starting Cloudflare tunnel..."
if [ -f "/tmp/cloudflared-new" ]; then
    nohup /tmp/cloudflared-new tunnel --url http://localhost:3000 > /tmp/cloudflare-tunnel.log 2>&1 &
    TUNNEL_PID=$!
    echo "  Tunnel started (PID: $TUNNEL_PID)"
    sleep 8
    TUNNEL_URL=$(grep -o 'https://.*\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)
    if [ -n "$TUNNEL_URL" ]; then
        echo "  ✅ Tunnel URL: $TUNNEL_URL"
    fi
else
    echo "  ⚠️  Cloudflared not found, skipping tunnel"
    echo "  Install with: curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared-new && chmod +x /tmp/cloudflared-new"
fi

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📊 Service URLs:"
echo "  Frontend:    http://localhost:3000"
echo "  Backend:     http://localhost:3001"
if [ -n "$TUNNEL_URL" ]; then
    echo "  Tunnel:      $TUNNEL_URL"
fi
echo ""
echo "📝 Logs:"
echo "  Backend:  tail -f /tmp/secret-time-backend.log"
echo "  Frontend: tail -f /tmp/secret-time-frontend.log"
echo "  Tunnel:   tail -f /tmp/cloudflare-tunnel.log"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Keep script running
wait
