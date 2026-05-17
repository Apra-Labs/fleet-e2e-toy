#!/usr/bin/env bash
exec ts-node "$(dirname "$0")/src/index.ts" "$@"
