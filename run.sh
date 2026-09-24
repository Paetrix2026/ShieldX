#!/usr/bin/env bash
# ============================================================
#  ShieldX / Vantix — Project Launcher
#  Starts: Backend (Node.js) + Admin Dashboard (Vite)
#  Excludes: vantix-agent (clipboard agent)
# ============================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/vantix-backend"
ADMIN_DIR="$ROOT_DIR/vantix-admin"

# ── Colours ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── PID tracking ─────────────────────────────────────────────
BACKEND_PID=""
ADMIN_PID=""

cleanup() {
    echo ""
    echo -e "${YELLOW}[ShieldX] Shutting down all services...${RESET}"
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null && echo -e "  ${RED}✖${RESET} Backend stopped"
    [ -n "$ADMIN_PID"   ] && kill "$ADMIN_PID"   2>/dev/null && echo -e "  ${RED}✖${RESET} Admin dashboard stopped"
    echo -e "${CYAN}[ShieldX] All services stopped. Goodbye!${RESET}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# ── Header ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║        ShieldX / Vantix Launcher         ║${RESET}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════╝${RESET}"
echo ""

# ── Dependency check ─────────────────────────────────────────
check_dep() {
    command -v "$1" &>/dev/null || { echo -e "${RED}[ERROR] '$1' not found. Please install it first.${RESET}"; exit 1; }
}
check_dep node
check_dep npm

# ── Install deps if needed ───────────────────────────────────
install_if_needed() {
    local dir="$1"
    local name="$2"
    if [ ! -d "$dir/node_modules" ]; then
        echo -e "${YELLOW}[ShieldX] Installing $name dependencies...${RESET}"
        (cd "$dir" && npm install --silent)
    fi
}

install_if_needed "$BACKEND_DIR" "backend"
install_if_needed "$ADMIN_DIR"   "admin"

# ── Start Backend ─────────────────────────────────────────────
echo -e "${GREEN}[1/2] Starting Backend${RESET}  →  http://localhost:5000"
(cd "$BACKEND_DIR" && npm run dev 2>&1 | sed 's/^/  [backend] /') &
BACKEND_PID=$!

# Give backend a moment to bind the port
sleep 2

# ── Start Admin Dashboard ─────────────────────────────────────
echo -e "${GREEN}[2/2] Starting Admin Dashboard${RESET}  →  http://localhost:5173"
(cd "$ADMIN_DIR" && npm run dev 2>&1 | sed 's/^/  [admin]   /') &
ADMIN_PID=$!

# ── Status summary ────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${BOLD}Backend API  ${RESET}: ${CYAN}http://localhost:5000/api${RESET}"
echo -e "  ${BOLD}Admin UI     ${RESET}: ${CYAN}http://localhost:5173${RESET}"
echo -e "  ${BOLD}Agent        ${RESET}: ${YELLOW}skipped (clipboard agent excluded)${RESET}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop all services."
echo ""

# ── Wait ──────────────────────────────────────────────────────
wait
