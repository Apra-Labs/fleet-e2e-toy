---
paths:
  - "src/api/**/*.ts"
---

All API handlers must validate inputs before processing.
Use validation helpers from `src/utils/validation.ts` — do not inline validation logic.
Never return raw database errors or stack traces to the client.
All error responses must use the format: `{ error: "Human-readable message" }` or `{ errors: [...] }`.
Always set explicit HTTP status codes — never rely on Express defaults.
Use early returns for error cases to keep the happy path unindented.
