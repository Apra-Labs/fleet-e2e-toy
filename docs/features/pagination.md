# Pagination — GET /api/notes

## What It Does

The `GET /api/notes` endpoint returns a paginated envelope rather than a flat array of notes. Pagination is opt-in via query parameters; sensible defaults apply when neither is supplied.

## Query Parameters

| Parameter | Type | Default | Constraints |
|-----------|------|---------|-------------|
| `page` | positive integer | `1` | 1-based; 0, negative, or non-integer values return 400 |
| `limit` | positive integer | `20` | max `100`; 0, negative, >100, or non-integer values return 400 |

Both parameters are optional. Omitting them yields the first 20 results.

## Response Shape

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

All existing filter parameters (`tag`, `q`) are unchanged. Pagination is applied **after** filtering, so `total` reflects the filtered count, not the count of all notes in the store.

When the store is empty, `totalPages` is `0` (not `1`).

## Error Responses

Invalid `page` or `limit` returns HTTP 400:

```json
{ "error": "Invalid page parameter" }
{ "error": "Invalid limit parameter" }
```

## Key Design Decisions

**Breaking response shape.** Moving from `Note[]` to the envelope object is a deliberate breaking change. All callers must unwrap `.data` to access note records. The trade-off — breaking existing clients in exchange for a stable, extensible envelope — was accepted because the API had no versioning and the change would need to happen before any external consumers were established.

**Pagination applied after filtering.** `total` and `totalPages` reflect the filtered set. This makes pagination composable with search/tag filters without a second count query.

**Limit capped at 100.** This guards the in-memory store from returning unbounded payloads. The cap is enforced in the handler; exceeding it returns 400 rather than silently clamping.

**Integer validation is strict.** The parser rejects any non-digit string (including floats like `"1.5"`). The regex `^\d+$` is applied before `parseInt`, so values like `"2abc"` are rejected.
