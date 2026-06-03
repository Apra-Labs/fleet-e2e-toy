#!/usr/bin/env bash
exec npx ts-node "$(dirname "$0")/src/cli.ts" "$@"
