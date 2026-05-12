#!/usr/bin/env pwsh
# Script to execute commits and run tests

$ErrorActionPreference = "Stop"

Write-Host "Step 1: Commit T3 test updates" -ForegroundColor Cyan
git add tests/notes.test.ts
git commit -m "T3: Update existing GET /api/notes tests for pagination envelope"

Write-Host "`nStep 2: Commit T4 API implementation" -ForegroundColor Cyan
git add src/api/notes.ts
git commit -m "T4: Implement pagination in GET /api/notes"

Write-Host "`nStep 3: Commit progress.json for T5" -ForegroundColor Cyan
git add progress.json
git commit -m "T5: Add pagination-specific tests"

Write-Host "`nStep 4: Running npm test" -ForegroundColor Cyan
npm test 2>&1 | Tee-Object -Variable testOutput
$testResult = $LASTEXITCODE

Write-Host "`nStep 5: Running npm run build" -ForegroundColor Cyan
npm run build 2>&1 | Tee-Object -Variable buildOutput
$buildResult = $LASTEXITCODE

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
if ($testResult -eq 0) {
    Write-Host "Tests PASSED" -ForegroundColor Green
} else {
    Write-Host "Tests FAILED" -ForegroundColor Red
}

Write-Host "`n=== BUILD SUMMARY ===" -ForegroundColor Green
if ($buildResult -eq 0) {
    Write-Host "Build PASSED" -ForegroundColor Green
} else {
    Write-Host "Build FAILED" -ForegroundColor Red
}

if ($testResult -eq 0 -and $buildResult -eq 0) {
    Write-Host "`nStep 6: Pushing to origin" -ForegroundColor Cyan
    git push origin e2e-s1.1-25715106074/notes-api-features
    Write-Host "Push completed successfully" -ForegroundColor Green
} else {
    Write-Host "`nSkipping push due to test or build failures" -ForegroundColor Red
    exit 1
}
