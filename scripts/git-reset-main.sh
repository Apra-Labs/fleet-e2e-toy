#!/usr/bin/env bash
# Reset local repo to origin/main, deleting all local branches,
# while preserving the contents of sprint-logs/ as-is.
#
# Usage: bash scripts/git-reset-main.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"

echo "=== Git reset: syncing to origin/main ==="

# 1. Stash any untracked/modified files so checkout to main doesn't fail
echo "Stashing working tree..."
git -C "$REPO_ROOT" stash push --include-untracked --message "git-reset-main auto-stash" 2>/dev/null || true

# 2. Switch to main
git -C "$REPO_ROOT" checkout main

# 3. Fetch and reset hard to origin/main
git -C "$REPO_ROOT" fetch origin main
git -C "$REPO_ROOT" reset --hard origin/main

# 4. Delete all local branches except main
local_branches=$(git -C "$REPO_ROOT" branch | grep -v '^\* ' | tr -d ' ' || true)
if [ -n "$local_branches" ]; then
  echo "Deleting local branches: $local_branches"
  echo "$local_branches" | xargs git -C "$REPO_ROOT" branch -D
else
  echo "No extra local branches to delete."
fi

# 5. Restore sprint-logs from the stash (if the stash exists and had sprint-logs)
#    We restore only sprint-logs, then drop the stash.
SPRINT_LOGS="$REPO_ROOT/sprint-logs"
STASH_REF=$(git -C "$REPO_ROOT" stash list --format="%gd %s" 2>/dev/null | grep "git-reset-main auto-stash" | head -1 | awk '{print $1}')

if [ -n "$STASH_REF" ]; then
  echo "Restoring sprint-logs from stash..."
  git -C "$REPO_ROOT" checkout "$STASH_REF" -- sprint-logs 2>/dev/null || true
  git -C "$REPO_ROOT" stash drop "$STASH_REF" 2>/dev/null || true
  # Unstage sprint-logs (we want it untracked, not staged)
  git -C "$REPO_ROOT" reset HEAD sprint-logs 2>/dev/null || true
fi

echo ""
echo "=== Done. $(git -C "$REPO_ROOT" log --oneline -1) ==="
echo "Local branches: $(git -C "$REPO_ROOT" branch | tr '\n' ' ')"
