# integ-test-playbook.md

Integration test environment for NoteAPI. The app is stateless and in-memory — there
is no external database or message broker. All state is lost on restart, which makes
reset trivial.

## Setup

Install all npm dependencies and compile the TypeScript source.
Start the server in the background on port 3001 using `npm run start:test`.
Wait until `http://localhost:3001/health` returns 200 before proceeding (retry up to 10 times, 1 second apart).

## Reset

Stop any process listening on port 3001, then start the server again on port 3001.
Wait until `http://localhost:3001/health` returns 200 before proceeding.
This clears all in-memory data, returning the app to a clean state.

## Teardown

Stop any process listening on port 3001.
