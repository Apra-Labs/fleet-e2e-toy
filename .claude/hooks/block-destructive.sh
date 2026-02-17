#!/bin/bash
# PreToolUse hook: tiered response to risky commands
# Exit 2 = hard block (irreversible, high blast radius)
# Exit 0 + JSON "ask" = prompt user for confirmation (moderate risk)
# Exit 0 (no JSON) = allow silently

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Tier 1: HARD BLOCK — irreversible, high blast radius
if echo "$COMMAND" | grep -qE 'git\s+push\s+--force|drop\s+table|truncate\s+table'; then
  echo "BLOCKED: Irreversible command detected: $COMMAND"
  exit 2
fi

# Tier 2: ASK USER — destructive but sometimes intentional
if echo "$COMMAND" | grep -qE 'rm\s+-r'; then
  cat <<HOOK_JSON
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Recursive delete detected: $COMMAND"
  }
}
HOOK_JSON
  exit 0
fi

# Everything else: allow silently
exit 0
