@echo off
npx ts-node src/cli.ts %*
exit /b %errorlevel%
