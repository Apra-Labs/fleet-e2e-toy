#!/usr/bin/env bash
# Full environment reset: git + beads.
#   1. git-reset-main.sh  — reset to origin/main, drop all local branches,
#                           preserve sprint-logs/
#   2. beads-reset.sh     — wipe Dolt DB and restore canonical 8-issue backlog
#
# Usage: bash scripts/reset.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo " STEP 1: Git reset to origin/main"
echo "========================================"
bash "$SCRIPT_DIR/git-reset-main.sh"

echo ""
echo "========================================"
echo " STEP 2: Beads reset to canonical backlog"
echo "========================================"
bash "$SCRIPT_DIR/beads-reset.sh"

echo ""
echo "======================================== "
echo " Reset complete."
echo "========================================"
