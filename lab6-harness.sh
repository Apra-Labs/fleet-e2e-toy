#!/bin/bash
# Overnight harness loop — runs AGENT_PROMPT.md across multiple context windows.
# Each session completes exactly one feature, then exits. This loop restarts it.
# Press Ctrl+C to stop.

trap 'echo ""; echo "  HARNESS STOPPED."; exit 0' INT

while true; do
  echo ""
  echo "========================================"
  echo "  STARTING NEW CONTEXT WINDOW"
  echo "========================================"
  echo ""
  OUTPUT=$(claude -p "$(cat AGENT_PROMPT.md)" --max-turns 15 --dangerously-skip-permissions 2>&1)
  echo "$OUTPUT"

  if echo "$OUTPUT" | grep -q "ALL_FEATURES_DONE"; then
    echo ""
    echo "========================================"
    echo "  ALL FEATURES COMPLETE — harness exiting."
    echo "========================================"
    exit 0
  fi

  echo ""
  echo "  SESSION EXITED — restarting in 3s..."
  sleep 3
done
