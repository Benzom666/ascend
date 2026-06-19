#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/lesociety/latest/home/node/secret-time-next"
API_DIR="$ROOT_DIR/lesociety/latest/home/node/secret-time-next-api"
FRONTEND_ENV="$FRONTEND_DIR/.env"
FRONTEND_ENV_LOCAL="$FRONTEND_DIR/.env.local"
API_ENV="$API_DIR/.env"
LOG_DIR="$ROOT_DIR/logs"
FRONTEND_LOG="$LOG_DIR/mobile-frontend.log"
API_LOG="$LOG_DIR/mobile-api.log"
FRONTEND_PID_FILE="/tmp/lesociety-mobile-frontend.pid"
API_PID_FILE="/tmp/lesociety-mobile-api.pid"
FRONTEND_PORT="3000"
API_PORT="3001"
FRONTEND_MODE="development"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
  echo -e "${BLUE}→${NC} $1"
}

ok() {
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

fail() {
  echo -e "${RED}✗${NC} $1" >&2
  exit 1
}

stop_pid_from_file() {
  local pid_file="$1"
  local pid=""

  if [ ! -f "$pid_file" ]; then
    return 0
  fi

  pid="$(cat "$pid_file" 2>/dev/null || true)"
  if [ -n "${pid:-}" ] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    for _ in $(seq 1 20); do
      if ! kill -0 "$pid" 2>/dev/null; then
        break
      fi
      sleep 0.25
    done
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi

  rm -f "$pid_file"
}

cleanup() {
  local exit_code=$?
  stop_pid_from_file "$FRONTEND_PID_FILE"
  stop_pid_from_file "$API_PID_FILE"

  exit "$exit_code"
}

trap cleanup INT TERM EXIT

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

setup_node_runtime() {
  local preferred_version node_bin_dir latest_nvm_bin

  if [ -n "${NODE_BIN_DIR:-}" ] && [ -x "${NODE_BIN_DIR}/node" ]; then
    PATH="${NODE_BIN_DIR}:$PATH"
    hash -r
    return 0
  fi

  if [ -f "$ROOT_DIR/.nvmrc" ]; then
    preferred_version="$(tr -d '[:space:]' < "$ROOT_DIR/.nvmrc")"
    if [ -n "$preferred_version" ] && [ "${preferred_version#v}" = "$preferred_version" ]; then
      preferred_version="v${preferred_version}"
    fi
  fi

  if [ -n "${preferred_version:-}" ]; then
    node_bin_dir="$HOME/.nvm/versions/node/${preferred_version}/bin"
    if [ -x "${node_bin_dir}/node" ]; then
      PATH="${node_bin_dir}:$PATH"
      hash -r
      return 0
    fi
  fi

  if [ -d "$HOME/.nvm/versions/node" ]; then
    latest_nvm_bin="$(find "$HOME/.nvm/versions/node" -mindepth 2 -maxdepth 2 -type d -name bin | sort -V | tail -n 1)"
    if [ -n "${latest_nvm_bin:-}" ] && [ -x "${latest_nvm_bin}/node" ]; then
      PATH="${latest_nvm_bin}:$PATH"
      hash -r
      return 0
    fi
  fi
}

detect_lan_ip() {
  local os_name iface ip_addr
  if [ -n "${LAN_IP:-}" ]; then
    printf '%s\n' "$LAN_IP"
    return 0
  fi

  os_name="$(uname -s)"

  case "$os_name" in
    Linux)
      ip_addr="$(ip route get 1.1.1.1 2>/dev/null | awk '/src/ {for (i = 1; i <= NF; i++) if ($i == "src") { print $(i + 1); exit }}')"
      ;;
    Darwin)
      iface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2; exit}')"
      if [ -n "${iface:-}" ]; then
        ip_addr="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
      fi
      ;;
    *)
      ;;
  esac

  if [ -z "${ip_addr:-}" ]; then
    fail "Could not detect LAN IP automatically"
  fi

  printf '%s\n' "$ip_addr"
}

ensure_env_file() {
  local target="$1"
  local example="$2"

  if [ ! -f "$target" ]; then
    if [ -f "$example" ]; then
      cp "$example" "$target"
      ok "Created $(basename "$target") from example"
    else
      : > "$target"
      ok "Created $(basename "$target")"
    fi
  fi
}

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"

  if grep -q "^${key}=" "$file" 2>/dev/null; then
    perl -0pi -e "s|^${key}=.*\$|${key}=${value}|m" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >> "$file"
  fi
}

remove_env() {
  local file="$1"
  local key="$2"
  perl -0pi -e "s|^${key}=.*\n?||m" "$file"
}

ensure_firewall_rules() {
  local os_name
  os_name="$(uname -s)"

  case "$os_name" in
    Linux)
      if command -v ufw >/dev/null 2>&1; then
        info "Opening TCP ports ${FRONTEND_PORT} and ${API_PORT} in ufw"
        if sudo -n true >/dev/null 2>&1; then
          sudo -n ufw allow "${FRONTEND_PORT}/tcp" || warn "Could not run: sudo ufw allow ${FRONTEND_PORT}/tcp"
          sudo -n ufw allow "${API_PORT}/tcp" || warn "Could not run: sudo ufw allow ${API_PORT}/tcp"
        else
          warn "Firewall not changed automatically. Run these manually if needed:"
          echo "  sudo ufw allow ${FRONTEND_PORT}/tcp"
          echo "  sudo ufw allow ${API_PORT}/tcp"
        fi
      elif command -v firewall-cmd >/dev/null 2>&1; then
        info "Opening TCP ports ${FRONTEND_PORT} and ${API_PORT} in firewalld"
        if sudo -n true >/dev/null 2>&1; then
          sudo -n firewall-cmd --permanent --add-port="${FRONTEND_PORT}/tcp" || warn "Could not add firewalld rule for ${FRONTEND_PORT}/tcp"
          sudo -n firewall-cmd --permanent --add-port="${API_PORT}/tcp" || warn "Could not add firewalld rule for ${API_PORT}/tcp"
          sudo -n firewall-cmd --reload || warn "Could not reload firewalld"
        else
          warn "Firewall not changed automatically. Run these manually if needed:"
          echo "  sudo firewall-cmd --permanent --add-port=${FRONTEND_PORT}/tcp"
          echo "  sudo firewall-cmd --permanent --add-port=${API_PORT}/tcp"
          echo "  sudo firewall-cmd --reload"
        fi
      else
        warn "No supported Linux firewall tool detected; skipping firewall changes"
      fi
      ;;
    Darwin)
      if [ -x /usr/libexec/ApplicationFirewall/socketfilterfw ]; then
        info "Allowing Node.js through the macOS application firewall"
        if sudo -n true >/dev/null 2>&1; then
          sudo -n /usr/libexec/ApplicationFirewall/socketfilterfw --add "$(command -v node)" >/dev/null 2>&1 || warn "Could not add Node.js to macOS firewall allowlist"
          sudo -n /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp "$(command -v node)" >/dev/null 2>&1 || warn "Could not unblock Node.js in macOS firewall"
        else
          warn "Firewall not changed automatically. Run these manually if needed:"
          echo "  sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add $(command -v node)"
          echo "  sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp $(command -v node)"
        fi
      else
        warn "macOS application firewall tool not found; skipping firewall changes"
      fi
      ;;
    *)
      warn "Unsupported OS for automatic firewall setup; skipping firewall changes"
      ;;
  esac
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts="$3"
  local sleep_seconds="$4"

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      ok "$label is ready"
      return 0
    fi
    sleep "$sleep_seconds"
  done

  return 1
}

kill_existing_port_processes() {
  local os_name pid
  os_name="$(uname -s)"

  info "Stopping anything already listening on ${FRONTEND_PORT}/${API_PORT}"

  if [ "$os_name" = "Linux" ] && command -v fuser >/dev/null 2>&1; then
    fuser -k "${FRONTEND_PORT}/tcp" 2>/dev/null || true
    fuser -k "${API_PORT}/tcp" 2>/dev/null || true
  elif command -v lsof >/dev/null 2>&1; then
    pid="$(lsof -ti tcp:${FRONTEND_PORT} 2>/dev/null || true)"
    [ -n "${pid:-}" ] && kill $pid 2>/dev/null || true
    pid="$(lsof -ti tcp:${API_PORT} 2>/dev/null || true)"
    [ -n "${pid:-}" ] && kill $pid 2>/dev/null || true
  fi
}

port_has_listener() {
  local os_name port
  os_name="$(uname -s)"
  port="$1"

  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"$port" >/dev/null 2>&1
    return $?
  fi

  if [ "$os_name" = "Linux" ] && command -v fuser >/dev/null 2>&1; then
    fuser "${port}/tcp" >/dev/null 2>&1
    return $?
  fi

  return 0
}

stop_backend() {
  stop_pid_from_file "$API_PID_FILE"
}

stop_frontend() {
  stop_pid_from_file "$FRONTEND_PID_FILE"
}

start_backend() {
  info "Starting backend on ${API_URL}"
  : > "$API_LOG"
  (cd "$API_DIR" && nohup node bin/www > "$API_LOG" 2>&1 & echo $! > "$API_PID_FILE")

  if ! wait_for_url "http://127.0.0.1:${API_PORT}/health" "Backend" 30 1; then
    fail "Backend failed to start. Check $API_LOG"
  fi
}

start_frontend() {
  info "Starting frontend in development mode on ${FRONTEND_URL}"
  : > "$FRONTEND_LOG"
  (
    cd "$FRONTEND_DIR"
    nohup env NODE_OPTIONS=--openssl-legacy-provider ./node_modules/.bin/next dev -H 0.0.0.0 -p "$FRONTEND_PORT" > "$FRONTEND_LOG" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
  )
  FRONTEND_MODE_LABEL="Development frontend server with hot reload"

  if ! wait_for_url "http://127.0.0.1:${FRONTEND_PORT}" "Frontend" 45 2; then
    fail "Frontend failed to start. Check $FRONTEND_LOG"
  fi
}

restart_services() {
  info "Refreshing mobile localhost services"
  stop_frontend
  stop_backend
  kill_existing_port_processes
  start_backend
  start_frontend
  ok "Refresh complete"
  echo
  echo "Frontend: $FRONTEND_URL"
  echo "API:      $API_URL"
}

echo "Ascend Mobile ${FRONTEND_MODE^} Start"
echo "================================"
echo

setup_node_runtime

require_command node
require_command npm
require_command curl

info "Using Node.js $(node --version) from $(command -v node)"

mkdir -p "$LOG_DIR"

LAN_IP="$(detect_lan_ip)"
FRONTEND_URL="http://${LAN_IP}:${FRONTEND_PORT}"
API_URL="http://${LAN_IP}:${API_PORT}"

info "Detected LAN IP: $LAN_IP"

ensure_env_file "$FRONTEND_ENV" "$FRONTEND_DIR/.env.example"
ensure_env_file "$FRONTEND_ENV_LOCAL" "$FRONTEND_DIR/.env.example"
ensure_env_file "$API_ENV" "$API_DIR/.env.example"

# For phone/LAN testing, default to the configured remote MongoDB unless the
# user explicitly opts into a localhost database.
if [ "${USE_LOCAL_MONGO:-0}" != "1" ] && grep -Eq '^MONGO_URI=mongodb://(127\.0\.0\.1|localhost):' "$API_ENV" 2>/dev/null; then
  remove_env "$API_ENV" "MONGO_URI"
  info "Removed local MONGO_URI so the API uses configured remote MongoDB credentials"
fi

upsert_env "$FRONTEND_ENV" "NEXT_PUBLIC_API_URL" "$API_URL"
upsert_env "$FRONTEND_ENV" "NEXT_PUBLIC_SOCKET_URL" "$API_URL"
upsert_env "$FRONTEND_ENV" "NEXT_PUBLIC_ENV" "$FRONTEND_MODE"
upsert_env "$FRONTEND_ENV_LOCAL" "NEXT_PUBLIC_API_URL" "$API_URL"
upsert_env "$FRONTEND_ENV_LOCAL" "NEXT_PUBLIC_SOCKET_URL" "$API_URL"
upsert_env "$FRONTEND_ENV_LOCAL" "NEXT_PUBLIC_ENV" "$FRONTEND_MODE"

upsert_env "$API_ENV" "APP_URL" "$API_URL"
upsert_env "$API_ENV" "FRONTEND_URL" "$FRONTEND_URL"
upsert_env "$API_ENV" "PORT" "$API_PORT"
upsert_env "$API_ENV" "NODE_ENV" "development"
upsert_env "$API_ENV" "ALLOWED_ORIGINS" "http://localhost:${FRONTEND_PORT},http://localhost:${API_PORT},${FRONTEND_URL},${API_URL}"

ok "Updated local .env files for LAN testing"

ensure_firewall_rules

if [ ! -d "$API_DIR/node_modules" ]; then
  info "Installing backend dependencies"
  (cd "$API_DIR" && npm install)
else
  ok "Backend dependencies already installed"
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  info "Installing frontend dependencies"
  (cd "$FRONTEND_DIR" && npm install)
else
  ok "Frontend dependencies already installed"
fi

kill_existing_port_processes

start_backend
start_frontend

echo
echo "Ready"
echo "-----"
echo "Frontend: $FRONTEND_URL"
echo "API:      $API_URL"
echo
echo "Test on phone:"
echo "  $FRONTEND_URL"
echo "Mode:"
echo "  $FRONTEND_MODE_LABEL"
echo
echo "Firewall commands attempted:"
echo "  Linux: sudo ufw allow ${FRONTEND_PORT}/tcp && sudo ufw allow ${API_PORT}/tcp"
echo "  macOS: allow Node.js in Application Firewall"
echo
echo "Logs:"
echo "  $FRONTEND_LOG"
echo "  $API_LOG"
echo
echo "Press r to refresh both servers, or Ctrl+C to stop."

while true; do
  frontend_alive=false
  api_alive=false

  if port_has_listener "$FRONTEND_PORT"; then
    frontend_alive=true
  fi

  if port_has_listener "$API_PORT"; then
    api_alive=true
  fi

  if [ "$frontend_alive" = false ] || [ "$api_alive" = false ]; then
    warn "One of the services stopped. Exiting launcher."
    exit 1
  fi

  if [ -t 0 ]; then
    if IFS= read -rsn1 -t 2 key; then
      case "$key" in
        r|R)
          echo
          restart_services
          ;;
      esac
    fi
  else
    sleep 2
  fi
done
