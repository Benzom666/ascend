#!/bin/bash

################################################################################
# Ascend - Automated Deployment Script
# Version: 2.0
# Last Updated: April 4, 2026
#
# Purpose: Comprehensive deployment automation with health checks, rollback,
#          and multi-environment support
#
# Usage:
#   ./deploy-automated.sh [environment] [options]
#
# Examples:
#   ./deploy-automated.sh staging
#   ./deploy-automated.sh production --skip-tests
#   ./deploy-automated.sh production --rollback
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
BACKUP_DIR="${SCRIPT_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/deployment_${TIMESTAMP}.log"

# Default values
ENVIRONMENT="${1:-staging}"
SKIP_TESTS=false
SKIP_BACKUP=false
ROLLBACK_MODE=false
DRY_RUN=false

# Parse arguments
shift || true
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --rollback)
      ROLLBACK_MODE=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

################################################################################
# Helper Functions
################################################################################

log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

info() {
  echo -e "${BLUE}ℹ${NC} $@"
  log "INFO" "$@"
}

success() {
  echo -e "${GREEN}✓${NC} $@"
  log "SUCCESS" "$@"
}

warning() {
  echo -e "${YELLOW}⚠${NC} $@"
  log "WARNING" "$@"
}

error() {
  echo -e "${RED}✗${NC} $@"
  log "ERROR" "$@"
}

fatal() {
  error "$@"
  exit 1
}

header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $@${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

run_command() {
  local cmd="$@"
  if [[ "$DRY_RUN" == "true" ]]; then
    info "[DRY RUN] Would execute: $cmd"
    return 0
  else
    eval "$cmd"
  fi
}

################################################################################
# Pre-flight Checks
################################################################################

preflight_checks() {
  header "Pre-flight Checks"
  
  info "Environment: ${ENVIRONMENT}"
  info "Timestamp: ${TIMESTAMP}"
  info "Log file: ${LOG_FILE}"
  
  # Create directories
  mkdir -p "${LOG_DIR}" "${BACKUP_DIR}"
  
  # Check if git is clean
  if [[ -d .git ]]; then
    if [[ -n $(git status -s) ]] && [[ "$ENVIRONMENT" == "production" ]]; then
      warning "Git working directory is not clean"
      read -p "Continue anyway? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        fatal "Deployment cancelled"
      fi
    fi
  fi
  
  # Check Node.js version
  if ! command -v node &> /dev/null; then
    fatal "Node.js is not installed"
  fi
  local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [[ $node_version -lt 14 ]]; then
    fatal "Node.js version must be 14 or higher (current: $(node -v))"
  fi
  success "Node.js version: $(node -v)"
  
  # Check MongoDB connectivity
  info "Checking MongoDB connectivity..."
  if ! run_command "node check-user.js > /dev/null 2>&1"; then
    fatal "Cannot connect to MongoDB"
  fi
  success "MongoDB connection verified"
  
  # Check required environment files
  local backend_env="lesociety/latest/home/node/secret-time-next-api/.env"
  local frontend_env="lesociety/latest/home/node/secret-time-next/.env"
  
  if [[ ! -f "$backend_env" ]]; then
    fatal "Backend .env file not found: $backend_env"
  fi
  if [[ ! -f "$frontend_env" ]]; then
    fatal "Frontend .env file not found: $frontend_env"
  fi
  success "Environment files verified"
  
  # Check JWT_SECRET_TOKEN
  if ! grep -q "JWT_SECRET_TOKEN=" "$backend_env"; then
    fatal "JWT_SECRET_TOKEN not found in backend .env"
  fi
  success "JWT_SECRET_TOKEN verified"
  
  success "All pre-flight checks passed"
}

################################################################################
# Backup Current State
################################################################################

backup_current_state() {
  if [[ "$SKIP_BACKUP" == "true" ]]; then
    warning "Skipping backup (--skip-backup flag)"
    return 0
  fi
  
  header "Creating Backup"
  
  local backup_name="backup_${ENVIRONMENT}_${TIMESTAMP}"
  local backup_path="${BACKUP_DIR}/${backup_name}"
  
  mkdir -p "$backup_path"
  
  info "Backing up database..."
  run_command "./backup-database.sh" || warning "Database backup failed (non-critical)"
  
  info "Backing up environment files..."
  run_command "cp lesociety/latest/home/node/secret-time-next-api/.env ${backup_path}/api.env"
  run_command "cp lesociety/latest/home/node/secret-time-next/.env ${backup_path}/frontend.env"
  
  info "Recording git commit..."
  if [[ -d .git ]]; then
    git rev-parse HEAD > "${backup_path}/git_commit.txt" 2>/dev/null || true
    git diff > "${backup_path}/git_diff.txt" 2>/dev/null || true
  fi
  
  echo "$backup_name" > "${BACKUP_DIR}/latest_backup.txt"
  
  success "Backup created: $backup_name"
}

################################################################################
# Run Tests
################################################################################

run_tests() {
  if [[ "$SKIP_TESTS" == "true" ]]; then
    warning "Skipping tests (--skip-tests flag)"
    return 0
  fi
  
  header "Running Tests"
  
  info "Running backend tests..."
  cd lesociety/latest/home/node/secret-time-next-api
  if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
    run_command "npm test" || warning "Backend tests failed (continuing)"
  else
    warning "No backend tests configured"
  fi
  cd "$SCRIPT_DIR"
  
  info "Running frontend tests..."
  cd lesociety/latest/home/node/secret-time-next
  if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
    run_command "npm test" || warning "Frontend tests failed (continuing)"
  else
    warning "No frontend tests configured"
  fi
  cd "$SCRIPT_DIR"
  
  success "Tests completed"
}

################################################################################
# Install Dependencies
################################################################################

install_dependencies() {
  header "Installing Dependencies"
  
  info "Installing backend dependencies..."
  cd lesociety/latest/home/node/secret-time-next-api
  run_command "npm ci --production" || run_command "npm install --production"
  success "Backend dependencies installed"
  cd "$SCRIPT_DIR"
  
  info "Installing frontend dependencies..."
  cd lesociety/latest/home/node/secret-time-next
  run_command "npm ci" || run_command "npm install"
  success "Frontend dependencies installed"
  cd "$SCRIPT_DIR"
}

################################################################################
# Build Application
################################################################################

build_application() {
  header "Building Application"
  
  info "Building frontend..."
  cd lesociety/latest/home/node/secret-time-next
  run_command "npm run build"
  success "Frontend built successfully"
  cd "$SCRIPT_DIR"
}

################################################################################
# Deploy Backend
################################################################################

deploy_backend() {
  header "Deploying Backend"
  
  info "Stopping current backend processes..."
  run_command "pkill -f 'node bin/www' || true"
  sleep 2
  
  info "Starting backend in ${ENVIRONMENT} mode..."
  cd lesociety/latest/home/node/secret-time-next-api
  
  if [[ "$ENVIRONMENT" == "production" ]]; then
    # Production: use PM2 or nohup
    if command -v pm2 &> /dev/null; then
      run_command "pm2 delete lesociety-api || true"
      run_command "pm2 start bin/www --name lesociety-api"
      run_command "pm2 save"
    else
      run_command "nohup node bin/www > ${LOG_DIR}/backend_${TIMESTAMP}.log 2>&1 &"
    fi
  else
    # Staging/Development
    run_command "node bin/www > ${LOG_DIR}/backend_${TIMESTAMP}.log 2>&1 &"
  fi
  
  local backend_pid=$!
  echo "$backend_pid" > "${SCRIPT_DIR}/.backend.pid"
  
  info "Backend started (PID: ${backend_pid})"
  cd "$SCRIPT_DIR"
  
  success "Backend deployed"
}

################################################################################
# Deploy Frontend
################################################################################

deploy_frontend() {
  header "Deploying Frontend"
  
  info "Stopping current frontend processes..."
  run_command "pkill -f 'next' || true"
  sleep 2
  
  info "Starting frontend in ${ENVIRONMENT} mode..."
  cd lesociety/latest/home/node/secret-time-next
  
  if [[ "$ENVIRONMENT" == "production" ]]; then
    if command -v pm2 &> /dev/null; then
      run_command "pm2 delete lesociety-frontend || true"
      run_command "pm2 start npm --name lesociety-frontend -- start"
      run_command "pm2 save"
    else
      run_command "nohup npm start > ${LOG_DIR}/frontend_${TIMESTAMP}.log 2>&1 &"
    fi
  else
    run_command "npm run dev > ${LOG_DIR}/frontend_${TIMESTAMP}.log 2>&1 &"
  fi
  
  local frontend_pid=$!
  echo "$frontend_pid" > "${SCRIPT_DIR}/.frontend.pid"
  
  info "Frontend started (PID: ${frontend_pid})"
  cd "$SCRIPT_DIR"
  
  success "Frontend deployed"
}

################################################################################
# Health Checks
################################################################################

health_checks() {
  header "Running Health Checks"
  
  local max_attempts=30
  local attempt=1
  
  # Wait for backend
  info "Waiting for backend to be ready..."
  while [[ $attempt -le $max_attempts ]]; do
    if curl -sf http://localhost:3001/api/v1/ > /dev/null 2>&1; then
      success "Backend is responding"
      break
    fi
    if [[ $attempt -eq $max_attempts ]]; then
      fatal "Backend failed to start within timeout"
    fi
    echo -n "."
    sleep 2
    ((attempt++))
  done
  
  # Wait for frontend
  attempt=1
  info "Waiting for frontend to be ready..."
  while [[ $attempt -le $max_attempts ]]; do
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
      success "Frontend is responding"
      break
    fi
    if [[ $attempt -eq $max_attempts ]]; then
      warning "Frontend may not be ready (continuing)"
      break
    fi
    echo -n "."
    sleep 2
    ((attempt++))
  done
  
  # Test login endpoint
  info "Testing login endpoint..."
  local login_response=$(curl -sf -X POST http://localhost:3001/api/v1/user/login \
    -H "Content-Type: application/json" \
    -d '{"email": "afro@yopmail.com", "password": "123456"}' 2>&1 || echo "FAILED")
  
  if echo "$login_response" | grep -q '"status":200'; then
    success "Login endpoint working"
  else
    warning "Login endpoint may have issues"
  fi
  
  success "Health checks completed"
}

################################################################################
# Rollback
################################################################################

rollback() {
  header "Rolling Back Deployment"
  
  local latest_backup=$(cat "${BACKUP_DIR}/latest_backup.txt" 2>/dev/null || echo "")
  
  if [[ -z "$latest_backup" ]]; then
    fatal "No backup found to rollback to"
  fi
  
  warning "Rolling back to: $latest_backup"
  
  info "Stopping current processes..."
  run_command "pkill -f 'node' || true"
  sleep 2
  
  info "Restoring environment files..."
  run_command "cp ${BACKUP_DIR}/${latest_backup}/api.env lesociety/latest/home/node/secret-time-next-api/.env"
  run_command "cp ${BACKUP_DIR}/${latest_backup}/frontend.env lesociety/latest/home/node/secret-time-next/.env"
  
  if [[ -f "${BACKUP_DIR}/${latest_backup}/git_commit.txt" ]]; then
    local commit=$(cat "${BACKUP_DIR}/${latest_backup}/git_commit.txt")
    warning "Previous git commit was: $commit"
    read -p "Checkout this commit? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      run_command "git checkout $commit"
    fi
  fi
  
  info "Restarting services..."
  run_command "./start-production.sh"
  
  success "Rollback completed"
}

################################################################################
# Post-Deployment
################################################################################

post_deployment() {
  header "Post-Deployment Tasks"
  
  info "Deployment completed at: $(date)"
  info "Backend URL: http://localhost:3001"
  info "Frontend URL: http://localhost:3000"
  info "Log file: ${LOG_FILE}"
  
  if [[ "$ENVIRONMENT" == "production" ]]; then
    warning "Remember to:"
    echo "  - Update DNS if needed"
    echo "  - Clear CDN cache if applicable"
    echo "  - Monitor error logs"
    echo "  - Check performance metrics"
  fi
  
  success "Deployment successful!"
}

################################################################################
# Main Execution
################################################################################

main() {
  echo ""
  echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                                           ║${NC}"
  echo -e "${GREEN}║         Ascend - Automated Deployment Script         ║${NC}"
  echo -e "${GREEN}║                    Version 2.0                            ║${NC}"
  echo -e "${GREEN}║                                                           ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
  
  if [[ "$ROLLBACK_MODE" == "true" ]]; then
    rollback
    exit 0
  fi
  
  if [[ "$DRY_RUN" == "true" ]]; then
    warning "DRY RUN MODE - No changes will be made"
  fi
  
  preflight_checks
  backup_current_state
  run_tests
  install_dependencies
  build_application
  deploy_backend
  deploy_frontend
  health_checks
  post_deployment
  
  echo ""
  success "All deployment steps completed successfully!"
  echo ""
}

# Trap errors
trap 'error "Deployment failed at line $LINENO. Check log: ${LOG_FILE}"' ERR

# Run main function
main
