#!/usr/bin/env bash
# Reset beads to the 8-issue backlog in .beads/issues.jsonl on main.
# Run this after every sprint experiment to clean up Dolt DB and remote.
#
# Usage: bash scripts/beads-reset.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"

echo "=== Beads reset: restoring to issues.jsonl on main ==="

# 1. Must be on main
current_branch=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo "ERROR: must be on main branch (currently on $current_branch)"
  exit 1
fi

# 2. Delete the embedded Dolt database so bd init starts fresh
echo "Deleting embedded Dolt database..."
rm -rf "$REPO_ROOT/.beads/embeddeddolt"

# 3. Init fresh from JSONL (sync.remote is disabled in config.yaml, so no remote pull)
echo "Initialising from .beads/issues.jsonl..."
BEADS_CONFIG="$REPO_ROOT/.beads/config.yaml"
bd -C "$REPO_ROOT" init --from-jsonl --prefix gh-toy || true

# 6. Identify and delete any issues not in the canonical JSONL
echo "Pruning non-canonical issues..."
canonical=$(python -c "
import json, sys
with open('$REPO_ROOT/.beads/issues.jsonl') as f:
    ids = [json.loads(l)['id'] for l in f if l.strip()]
print(' '.join(ids))
")

junk=$(bd -C "$REPO_ROOT" list --all --json 2>/dev/null | python -c "
import json, sys
canonical = set('$canonical'.split())
issues = json.load(sys.stdin)
junk = [i['id'] for i in issues if i['id'] not in canonical]
print(' '.join(junk))
")

if [ -n "$junk" ]; then
  # shellcheck disable=SC2086
  bd -C "$REPO_ROOT" delete $junk --force
  echo "Deleted junk issues: $junk"
else
  echo "No junk issues found."
fi

echo ""
echo "=== Done. Beads reset to $(bd -C "$REPO_ROOT" list --all 2>/dev/null | grep Total) ==="
