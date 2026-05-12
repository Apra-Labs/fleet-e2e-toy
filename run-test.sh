#!/bin/bash
set -e

WORK_DIR="C:\Users\akhil\git\apra-fleet-e2e-doer\fleet-e2e-toy"

echo "Step 1: Commit T3 test updates"
cd "$WORK_DIR"
git add tests/notes.test.ts
git commit -m "T3: Update existing GET /api/notes tests for pagination envelope"

echo ""
echo "Step 2: Commit T4 API implementation"
git add src/api/notes.ts
git commit -m "T4: Implement pagination in GET /api/notes"

echo ""
echo "Step 3: Commit progress.json for T5"
git add progress.json
git commit -m "T5: Add pagination-specific tests"

echo ""
echo "Step 4: Running npm test"
npm test

echo ""
echo "Step 5: Running npm run build"
npm run build

echo ""
echo "Step 6: Pushing to origin"
git push origin e2e-s1.1-25715106074/notes-api-features

echo ""
echo "All steps completed successfully!"
