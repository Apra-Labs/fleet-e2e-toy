#!/bin/bash
# Overnight harness loop — runs AGENT_PROMPT.md across multiple context windows.
# Each session completes exactly one feature, then exits. This loop restarts it.
# Press Ctrl+C to stop.

while true; do
  echo ""
  echo "========================================"
  echo "  STARTING NEW CONTEXT WINDOW"
  echo "========================================"
  echo ""
  claude -p "$(cat AGENT_PROMPT.md)" --max-turns 15 --dangerously-skip-permissions
  echo ""
  echo "  SESSION EXITED — restarting in 3s..."
  sleep 3
done
