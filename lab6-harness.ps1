# Overnight harness loop — runs AGENT_PROMPT.md across multiple context windows.
# Each session completes exactly one feature, then exits. This loop restarts it.
# Press Ctrl+C to stop.

try { while ($true) {
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  STARTING NEW CONTEXT WINDOW" -ForegroundColor Cyan
  Write-Host "========================================`n" -ForegroundColor Cyan
  $output = claude -p (Get-Content AGENT_PROMPT.md -Raw) --max-turns 15 --dangerously-skip-permissions 2>&1
  $output | Write-Host

  if ($output -match "ALL_FEATURES_DONE") {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  ALL FEATURES COMPLETE - harness exiting." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
  }

  Write-Host "`n  SESSION EXITED - restarting in 3s..." -ForegroundColor Yellow
  Start-Sleep 3
} } finally {
  Write-Host "`n  HARNESS STOPPED." -ForegroundColor Red
}
