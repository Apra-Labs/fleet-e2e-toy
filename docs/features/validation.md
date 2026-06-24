# Input Validation

## Overview

All write endpoints (`POST /api/notes`, `PUT /api/notes/:id`) validate input through shared helpers in `src/utils/validation.ts`. Validation errors are returned as an array of field-level objects before any store mutation occurs.

## Length Limits

| Field | Max Length | Measurement |
|-------|-----------|-------------|
| `title` | 200 characters | `trim().length` — leading/trailing whitespace is stripped before checking |
| `content` | 10 000 characters | raw `.length` — whitespace is not stripped |

Exceeding either limit returns HTTP 400 with the field-level error format below. The boundary values (exactly 200 / exactly 10 000 characters) are accepted.

## Error Format

Validation errors are returned as an array. Each entry identifies the offending field and provides a human-readable message:

```json
[
  { "field": "title",   "message": "Title must be 200 characters or fewer" },
  { "field": "content", "message": "Content must be 10000 characters or fewer" }
]
```

Multiple errors can be present in a single response (e.g., both `title` and `content` too long).

## Validation Functions

`validateCreateInput` — enforces presence and length for `title`; enforces type and length for `content`; validates `tags` array if present.

`validateUpdateInput` — all fields are optional (partial update); length limits are applied only when a field is supplied and passes its type check.

## Key Design Decisions

**Title measured after trim.** The store trims titles before persisting them, so the length check mirrors the stored value. A title of 200 characters of whitespace-padded content would be rejected as empty before the length check applies.

**Content measured raw.** Content is stored verbatim without trimming, so the raw length is the authoritative constraint.

**Additive, non-breaking change.** Previously valid requests (title <= 200, content <= 10 000) are wholly unaffected. Only requests that were previously accepted but would have produced unbounded storage are now rejected.

**Shared helpers for create and update.** Both `validateCreateInput` and `validateUpdateInput` apply the same limits independently so that neither endpoint can be used as a bypass.
