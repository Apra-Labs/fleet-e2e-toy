# integ-test-playbook.md

Integration test environment for NoteAPI. The app is stateless and in-memory,
so setup is just a clean server start; teardown is a process kill.

## Setup

```bash
npm ci
npm run build
PORT=3001 npm start &
echo $! > .server.pid
# Wait for the server to be ready
for i in $(seq 1 10); do
  curl -sf http://localhost:3001/notes && break
  sleep 1
done
```

## Reset

```bash
# The in-memory store resets on restart — kill and restart the server
kill $(cat .server.pid) 2>/dev/null || true
PORT=3001 npm start &
echo $! > .server.pid
for i in $(seq 1 10); do
  curl -sf http://localhost:3001/notes && break
  sleep 1
done
```

## Teardown

```bash
kill $(cat .server.pid) 2>/dev/null || true
rm -f .server.pid
```
