# Requirements: Add input validation for empty or blank strings (gh-toy-13t)

## Goal
Extend the NoteAPI's input validation to explicitly reject whitespace-only strings,
and add unit tests that cover these edge cases with clear error messages.

## Context

- Issue: gh-toy-13t
- File: `src/utils/validation.ts` — contains `validateCreateInput` and `validateUpdateInput`
- File: `tests/validation.test.ts` — existing unit tests for those functions

## Current state

`validateCreateInput`:
- Title: rejects empty/whitespace-only via `obj.title.trim().length === 0` ✓
- Content: checked to be a `string`, but allows empty/whitespace-only strings
- Tags: checks each element is a string, but allows empty/whitespace-only tag strings

`validateUpdateInput`:
- Title: rejects empty/whitespace-only when provided ✓
- Content: checked to be a `string` when provided, allows empty/whitespace-only
- Tags: same gap as above

Tests cover: missing title, empty title in update, non-object body, non-string tags.
Missing tests: whitespace-only title in create, whitespace-only title in update,
empty-string tags in the array.

## What needs to change

### Validation logic (`src/utils/validation.ts`)
1. In `validateCreateInput`: add a check that each tag element is non-empty after trim.
   Message: `"Tags must not contain empty or whitespace-only strings"`, field: `"tags"`.
2. In `validateUpdateInput`: same tag-element check when tags are provided.

Content is intentionally allowed to be empty (notes with no body are valid).

### Tests (`tests/validation.test.ts`)
Add the following cases to `validateCreateInput` describe block:
- "rejects whitespace-only title" → `{title: "   ", content: "Body"}` → valid: false, field: "title"
- "rejects tags with empty string elements" → `{title: "T", content: "B", tags: ["work", ""]}` → valid: false, field: "tags"
- "rejects tags with whitespace-only elements" → `{title: "T", content: "B", tags: ["  "]}` → valid: false, field: "tags"

Add to `validateUpdateInput` describe block:
- "rejects whitespace-only title" → `{title: "   "}` → valid: false
- "rejects tags with empty string elements" → `{tags: [""]}` → valid: false, field: "tags"

## Acceptance criteria
- All new tests pass.
- `npm test` exits 0, no regressions.
- `npm run build` exits 0.
- `npm run lint` exits 0.
- No design doc needed — single-obvious path change.
