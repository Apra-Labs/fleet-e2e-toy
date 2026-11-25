# Echo API

`GET /api/echo?msg=<text>` returns the `msg` query parameter back to the caller.

## Contract

| Request | Response |
|---------|----------|
| `?msg=hello` | `200 {"echo": "hello"}` |
| `?msg=hello%20world` | `200 {"echo": "hello world"}` (URL-decoded by Express) |
| `?msg=` (empty) | `200 {"echo": ""}` — an empty string is a valid message |
| no `msg` | `400 {"error": "msg query parameter is required"}` |
| `?msg=a&msg=b` (repeated) | `400 {"error": "msg query parameter is required"}` |

## Design notes

- Validation is a single `typeof msg === "string"` check. Express parses a missing
  parameter as `undefined` and a repeated parameter as an array, so one check rejects
  both. Do not loosen it to a truthiness test: that would wrongly reject the empty string.
- Errors follow the project convention: wrapped as `{ error: "message" }`, sent with
  `res.status(code).json(...)`.
- The router lives in `src/api/echo.ts` and is mounted at `/api/echo` in `src/app.ts`.
- Tests (`tests/echo.test.ts`) use supertest against the app, so removing the mount
  makes them fail with 404.
