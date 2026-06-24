#!/bin/bash
set -e

echo "=== CLI Integration Test ==="

# Build the CLI
echo "Building..."
npx tsc --outDir dist 2>&1

# Test --version
echo "--- Test: --version ---"
node dist/cli.js --version
VERSION_OUTPUT=$(node dist/cli.js --version)
if [ "$VERSION_OUTPUT" = "fleet-e2e-toy v1.0.0" ]; then
  echo "PASS: --version outputs correct version"
else
  echo "FAIL: --version output was '$VERSION_OUTPUT'"
  exit 1
fi

# Test --help
echo "--- Test: --help ---"
node dist/cli.js --help
if [ $? -eq 0 ]; then
  echo "PASS: --help exits 0"
else
  echo "FAIL: --help did not exit 0"
  exit 1
fi

# Test list --help
echo "--- Test: list --help ---"
node dist/cli.js list --help
if [ $? -eq 0 ]; then
  echo "PASS: list --help exits 0"
else
  echo "FAIL: list --help did not exit 0"
  exit 1
fi

# Test empty argument rejection
echo "--- Test: empty --title ---"
OUTPUT=$(node dist/cli.js create --title "" --content "Body" 2>&1 || true)
if echo "$OUTPUT" | grep -q "cannot be empty"; then
  echo "PASS: empty --title rejected"
else
  echo "FAIL: empty --title not rejected: $OUTPUT"
  exit 1
fi

# Test missing required argument
echo "--- Test: missing --title ---"
OUTPUT=$(node dist/cli.js create --content "Body" 2>&1 || true)
if echo "$OUTPUT" | grep -q "required"; then
  echo "PASS: missing --title rejected"
else
  echo "FAIL: missing --title not rejected: $OUTPUT"
  exit 1
fi

# Test unknown command
echo "--- Test: unknown command ---"
OUTPUT=$(node dist/cli.js unknown-cmd 2>&1 || true)
if echo "$OUTPUT" | grep -q "Unknown command"; then
  echo "PASS: unknown command rejected"
else
  echo "FAIL: unknown command not rejected: $OUTPUT"
  exit 1
fi

echo ""
echo "=== All integration tests passed ==="
