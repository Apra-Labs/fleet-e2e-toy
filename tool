#!/usr/bin/env bash
# Entry point CLI wrapper for fleet-e2e-toy (NoteAPI).
set -e
cd "$(dirname "$0")"
exec node -r ts-node/register src/index.ts "$@"
