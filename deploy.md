# deploy.md

## Deploy

Install all npm dependencies, then compile the TypeScript source.
Start the server in the background on port 3001 and wait a few seconds for it to become ready.

## Smoke test

Send an HTTP GET to `http://localhost:3001/health`.
A 200 response with `{"status":"ok"}` means the deployment is healthy.
Any other response or connection failure means the deployment failed.

## CI

```yaml
trigger: auto
```

CI fires automatically on push via `.github/workflows/ci.yml`. It runs lint, tests, and build.

## Teardown

Stop any process listening on port 3001.
