#!/bin/bash
# Overnight harness loop — runs AGENT_PROMPT.md across multiple context windows.
# Each session completes exactly one feature, then exits. This loop restarts it.
# Stops automatically when all features pass.
# To stop early: Ctrl+C, or create a file called STOP (touch STOP) from another terminal.

trap 'echo ""; echo "  HARNESS STOPPED."; exit 0' INT

rm -f STOP

while true; do
  echo ""
  echo "========================================"
  echo "  STARTING NEW CONTEXT WINDOW"
  echo "========================================"
  echo ""
  claude -p "$(cat AGENT_PROMPT.md)" --max-turns 15 --dangerously-skip-permissions

  if ! grep -q '"passes": false' feature_list.json; then
    echo ""
    echo "========================================"
    echo "  ALL FEATURES COMPLETE — harness exiting."
    echo "========================================"
    exit 0
  fi

  if [ -f STOP ]; then
    rm -f STOP
    echo ""
    echo "========================================"
    echo "  STOP file detected — harness exiting."
    echo "========================================"
    exit 0
  fi

  echo ""
  echo "  SESSION EXITED — restarting in 3s..."
  sleep 3
done
