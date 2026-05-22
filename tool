#!/usr/bin/env bash
# Determine the directory of this script to handle execution from other folders
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
npx ts-node "$DIR/src/cli.ts" "$@"
