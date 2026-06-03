#!/bin/bash
export RUNNING_AS_CLI=true
npx ts-node "$(dirname "$0")/src/index.ts" "$@"
