# Overnight harness loop — runs AGENT_PROMPT.md across multiple context windows.
# Each session completes exactly one feature, then exits. This loop restarts it.
# Stops automatically when all features pass.
# To stop early: create a file called STOP in this directory (from another terminal):
#   New-Item STOP -ItemType File

if (Test-Path STOP) { Remove-Item STOP }

while ($true) {
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  STARTING NEW CONTEXT WINDOW" -ForegroundColor Cyan
  Write-Host "========================================`n" -ForegroundColor Cyan
  claude -p (Get-Content AGENT_PROMPT.md -Raw) --max-turns 15 --dangerously-skip-permissions

  if (-not (Select-String -Path feature_list.json -Pattern '"passes": false' -Quiet)) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  ALL FEATURES COMPLETE - harness exiting." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
  }

  if (Test-Path STOP) {
    Remove-Item STOP
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "  STOP file detected - harness exiting." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 0
  }

  Write-Host "`n  SESSION EXITED - restarting in 3s..." -ForegroundColor Yellow
  Start-Sleep 3
}
