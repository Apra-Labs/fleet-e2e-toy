# NoteAPI — Query API: Tag Filtering, Full-Text Search, and Pagination

## Overview

`GET /api/notes` supports three composable query features: tag filtering, full-text search, and cursor-free pagination. When combined, they apply in a fixed order: **tag filter → search filter → paginate**. The response is always a paginated envelope, even when no pagination params are supplied.

---

## Response Shape

All `GET /api/notes` responses return a paginated envelope — there is no "bare array" mode:

```json
{
  "data": [ ...Note objects... ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

| Field   | Type     | Description                                                       |
|---------|----------|-------------------------------------------------------------------|
| `data`  | `Note[]` | The notes for this page, after all filters applied               |
| `total` | `number` | Count of notes after filtering (not the total store size)        |
| `page`  | `number` | The current page number, 1-indexed                               |
| `limit` | `number` | Maximum notes per page                                           |

`total` reflects the **post-filter** count. This is intentional: consumers can compute the page count as `Math.ceil(total / limit)` without needing a separate unfiltered count.

---

## Request Parameters

| Parameter | Type   | Default | Description                                     |
|-----------|--------|---------|-------------------------------------------------|
| `tag`     | string | —       | Exact-match tag filter (case-sensitive)         |
| `q`       | string | —       | Full-text search (case-insensitive substring)   |
| `page`    | number | `1`     | 1-indexed page number                           |
| `limit`   | number | `10`    | Notes per page                                  |

All parameters are optional. Absent `page`/`limit` params use defaults (`page=1`, `limit=10`).

---

## Tag Filtering (`?tag=`)

Filters the note store to notes whose `tags` array contains the given value. The match is **case-sensitive and exact** — `?tag=Work` does not match a note tagged `work`.

**Empty tag (`?tag=`):** Treated as no filter — all notes are returned.

**Multiple `?tag=` params (`?tag=a&tag=b`):** Express may parse repeated params as an array. The implementation applies **last-wins**: the last value in the array is used as the sole tag filter. AND/OR multi-tag semantics are out of scope.

**No matching notes:** Returns `{ "data": [], "total": 0, ... }` with HTTP 200 — not 404.

---

## Full-Text Search (`?q=`)

Performs a **case-insensitive substring match** against both the `title` and `content` fields of each note. A note matches if either field contains the query string.

**Empty query (`?q=`):** Treated as no filter — all notes are returned.

**No matching notes:** Returns `{ "data": [], "total": 0, ... }` with HTTP 200 — not 404.

**Special characters:** The implementation uses `String.includes()`, not a regex, so characters like `+`, `?`, and `[` are treated as literals. Queries like `?q=c++` or `?q=foo bar` are safe and do not throw.

---

## Pagination (`?page=` / `?limit=`)

Slices the result set after all filters have been applied.

**Defaults:** `page=1`, `limit=10`. The endpoint behaves identically whether the params are omitted or explicitly set to `1` and `10`.

**Fractional values:** Floored to integers. `?page=2.9` is treated as `page=2`.

**Page beyond the last:** Returns `{ "data": [], "total": <filtered-count>, ... }` with HTTP 200. `total` still reflects the full filtered count so the client can detect the over-run.

**`limit` larger than total:** Returns all matching notes in one page.

### Validation errors (HTTP 400)

| Condition              | Error message                    |
|------------------------|----------------------------------|
| Non-numeric `page`     | `"page must be a valid number"`  |
| Non-numeric `limit`    | `"limit must be a valid number"` |
| `page < 1`             | `"page must be at least 1"`      |
| `limit < 1`            | `"limit must be at least 1"`     |

Error response shape: `{ "error": "<message>" }`

---

## Composition

When multiple params are present, they apply in this order:

```
tag filter  →  search filter  →  paginate
```

`total` in the response always reflects the count **after all filters** and **before pagination**. Example:

```
GET /api/notes?tag=work&q=meeting&page=1&limit=5
```

1. Filter store to notes tagged `work`
2. Among those, keep notes with "meeting" in title or content
3. `total` = count of notes surviving steps 1–2
4. Return the first 5 (`data`), with `page: 1`, `limit: 5`

---

## Architecture Notes

**Pagination envelope is always present.** The list endpoint never returns a bare array. This gives consumers a consistent response shape regardless of whether pagination params were supplied, and avoids a breaking change if defaults ever change.

**`total` is post-filter.** Computed after tag and search filters run, before slicing. This is the right value for computing page counts and rendering "N results" UI — the unfiltered store size is not exposed.

**In-memory store.** The current implementation holds notes in a `Map<string, Note>`. Filters are applied in JS. This is suitable for development and testing; a production deployment would replace `noteStore` with a database-backed implementation behind the same interface.

**Input validation is centralised.** Pagination param parsing lives in `validatePaginationParams` in `src/utils/validation.ts`. Route handlers do not inline validation logic.

---

## Note Object Schema

```typescript
interface Note {
  id: string;        // UUID v4
  title: string;     // Non-empty, trimmed
  content: string;
  tags: string[];    // May be empty
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```
