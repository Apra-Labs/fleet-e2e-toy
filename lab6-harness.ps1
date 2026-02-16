# Overnight harness loop — runs AGENT_PROMPT.md across multiple context windows.
# Each session completes exactly one feature, then exits. This loop restarts it.
# Press Ctrl+C to stop.

while ($true) {
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  STARTING NEW CONTEXT WINDOW" -ForegroundColor Cyan
  Write-Host "========================================`n" -ForegroundColor Cyan
  claude -p (Get-Content AGENT_PROMPT.md -Raw) --max-turns 15 --dangerously-skip-permissions
  Write-Host "`n  SESSION EXITED - restarting in 3s..." -ForegroundColor Yellow
  Start-Sleep 3
}
