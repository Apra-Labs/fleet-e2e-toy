# Design — fleet-e2e-toy

## Problem
The current NoteAPI lacks robust search capabilities (missing edge case handling), pagination for large datasets, and a way to archive notes without permanent deletion.

## Solution
Implement a series of updates to the Note model and API endpoints:
1. **Search:** Refine existing search logic to handle empty queries and case-insensitivity correctly.
2. **Archiving:** Introduce an `archived` state for notes and provide endpoints to toggle this state.
3. **Pagination:** Wrap the API response in a structured object and implement page/limit slicing.

## Data Model
### Note
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| title | string | Note title |
| content | string | Note body |
| tags | string[] | List of tags |
| archived | boolean | Whether the note is archived |
| createdAt | ISO8601 | Creation timestamp |
| updatedAt | ISO8601 | Last update timestamp |

## API Changes
| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | /api/notes | - | List notes (supports q, page, limit, include_archived, tag) |
| POST | /api/notes/:id/archive | - | Mark note as archived |
| POST | /api/notes/:id/unarchive | - | Restore an archived note |

## What Gets Deleted
- None

## What Stays / Adapts
| What | Change |
|------|--------|
| `GET /api/notes` | Response body shape changes to `{data, total, page, limit}` |
| `Note` model | Added `archived` field |

## Out of Scope
- Durable storage (remains in-memory)
- User authentication
- Multiple tags filtering in a single query (currently single tag filter)
