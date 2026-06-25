APPROVED

All acceptance criteria for gh-toy-c2p.2 are met:

1. src/lib/apiClient.ts exports ApiClient class with get(path, query?), post(path, body), put(path, body), and del(path) methods returning parsed JSON or void for 204.
2. Base URL is configurable: defaults to 'http://localhost:3000', reads NOTEAPI_BASE_URL env var, and constructor accepts an override parameter.
3. Uses global fetch (no import needed for Node 18+/20+).
4. ApiError class exported with { status: number; message: string; body?: unknown } shape.
5. Non-2xx responses throw ApiError with status code and parsed error message: checks body.error string first, then body.errors[0].message, else falls back to 'HTTP <status>'.
6. Network errors (fetch throws) are caught and rethrown as ApiError with status=0 and message 'Cannot reach <baseUrl>: <reason>'.
7. No console output anywhere in the module — pure library.
8. Uses global fetch directly, making it unit-testable via jest.spyOn(global, 'fetch').
All 21 existing tests pass. Build and lint are clean.

reopenIds: []
newTasks: []
