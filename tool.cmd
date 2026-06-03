@echo off
set RUNNING_AS_CLI=true
npx ts-node "%~dp0src/index.ts" %*
