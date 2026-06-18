# deploy.md

## Deploy

```bash
npm ci
npm run build
PORT=3001 npm start &
echo $! > .server.pid
```

## Smoke test

```bash
curl -sf http://localhost:3001/notes && echo "OK" || exit 1
```

Exit 0 = healthy. Any other exit = deployment failed.

## CI

```yaml
trigger: auto
```

CI fires automatically on push to `main` and `feature/**` branches via `.github/workflows/ci.yml`.
It runs lint → test → build. Integration tests are separate (see `integ-test-playbook.md`).

## Teardown

```bash
kill $(cat .server.pid) 2>/dev/null || true
rm -f .server.pid
```
