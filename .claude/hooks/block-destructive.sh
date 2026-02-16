#!/bin/bash
# PreToolUse hook: block destructive commands
# Exit code 2 = block the tool call and send feedback to the agent

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE 'rm\s+-rf|git\s+push\s+--force|drop\s+table|truncate\s+table'; then
  echo "BLOCKED: Destructive command detected: $COMMAND"
  exit 2
fi

exit 0
