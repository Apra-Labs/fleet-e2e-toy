# updatedAt Timestamp Behaviour

## Invariant

Every `PUT /api/notes/:id` response contains an `updatedAt` field set to the ISO 8601 wall-clock time of that request. `createdAt` and `id` are never modified by an update.

## Guarantees

- `updatedAt` after a successful PUT is strictly greater than `updatedAt` before it (assuming system clock monotonicity).
- `createdAt` is immutable after creation.
- `id` is immutable after creation.

## Implementation

`noteStore.update()` in `src/models/note.ts` spreads the existing record, applies the caller's updates, then overwrites `id`, `createdAt`, and `updatedAt` explicitly:

```
updatedAt: new Date().toISOString()
```

The explicit overwrite ensures that even if a caller passes `updatedAt` in the request body, the server-controlled timestamp wins.

## Why It Matters

Clients using `updatedAt` for cache invalidation, conflict detection, or change-feed polling rely on this field advancing on every write. Prior to this fix, `updatedAt` was frozen at creation time, making those patterns unreliable.
