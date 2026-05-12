#!/usr/bin/env pwsh
# Execute commits for T3, T4, T5 and run tests

$workDir = "C:\Users\akhil\git\apra-fleet-e2e-doer\fleet-e2e-toy"

Write-Host "Step 1: Commit T3 test updates" -ForegroundColor Cyan
& git -C $workDir add tests/notes.test.ts
& git -C $workDir commit -m "T3: Update existing GET /api/notes tests for pagination envelope"
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }

Write-Host "Step 2: Commit T4 API implementation" -ForegroundColor Cyan
& git -C $workDir add src/api/notes.ts
& git -C $workDir commit -m "T4: Implement pagination in GET /api/notes"
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }

Write-Host "Step 3: Commit progress.json for T5" -ForegroundColor Cyan
& git -C $workDir add progress.json
& git -C $workDir commit -m "T5: Add pagination-specific tests"
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }

Write-Host "Step 4: Running npm test" -ForegroundColor Cyan
Push-Location $workDir
npm test 2>&1 | Tee-Object -FilePath (New-Item -Path "$workDir/test-output.log" -Force)
$testResult = $LASTEXITCODE
Pop-Location

Write-Host "Step 5: Running npm run build" -ForegroundColor Cyan
Push-Location $workDir
npm run build 2>&1 | Tee-Object -FilePath (New-Item -Path "$workDir/build-output.log" -Force)
$buildResult = $LASTEXITCODE
Pop-Location

Write-Host "`n=== SUMMARY ===" -ForegroundColor Green
if ($testResult -eq 0) {
    Write-Host "Tests PASSED" -ForegroundColor Green
} else {
    Write-Host "Tests FAILED" -ForegroundColor Red
}

if ($buildResult -eq 0) {
    Write-Host "Build PASSED" -ForegroundColor Green
} else {
    Write-Host "Build FAILED" -ForegroundColor Red
}

if ($testResult -eq 0 -and $buildResult -eq 0) {
    Write-Host "`nStep 6: Pushing to origin" -ForegroundColor Cyan
    & git -C $workDir push origin e2e-s1.1-25715106074/notes-api-features
    Write-Host "Push completed" -ForegroundColor Green
}
