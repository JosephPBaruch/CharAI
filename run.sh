#!/bin/bash

# CharAI Development Server Script
# Starts: Frontend (Vite), Backend (Django), and Reverse Proxy (Caddy)

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
PROXY_DIR="$PROJECT_DIR/local-proxy"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
  echo -e "${YELLOW}Shutting down services...${NC}"
  jobs -p | xargs -r kill 2>/dev/null || true
  wait
  echo -e "${GREEN}All services stopped.${NC}"
}

trap cleanup EXIT
trap cleanup SIGINT SIGTERM

# Check prerequisites
check_prerequisites() {
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
  fi
  
  if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
  fi
  
  if ! command -v caddy &> /dev/null; then
    echo -e "${YELLOW}Warning: Caddy (reverse proxy) is not installed. Install with: brew install caddy${NC}"
    echo -e "${YELLOW}Continuing without proxy on port 8088...${NC}"
    SKIP_PROXY=1
  fi
}

# Start Frontend
start_frontend() {
  echo -e "${GREEN}Starting Frontend (Vite) on port 5173...${NC}"
  cd "$FRONTEND_DIR"
  npm run dev &
}

# Start Backend
start_backend() {
  echo -e "${GREEN}Starting Backend (Django) on port 8000...${NC}"
  cd "$BACKEND_DIR"
  python3 manage.py runserver &
}

# Start Proxy
start_proxy() {
  if [ -z "$SKIP_PROXY" ]; then
    echo -e "${GREEN}Starting Reverse Proxy (Caddy) on port 8088...${NC}"
    cd "$PROXY_DIR"
    caddy run &
  fi
}

# Main
echo -e "${GREEN}Starting CharAI Development Environment${NC}"
echo ""

check_prerequisites
start_frontend
start_backend
# start_proxy

echo ""
echo -e "${GREEN}All services started!${NC}"
echo ""
echo "Access points:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
if [ -z "$SKIP_PROXY" ]; then
  echo "  Proxy:     http://localhost:8088"
else
  echo "  Proxy:     (not running - Caddy not installed)"
fi
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait

