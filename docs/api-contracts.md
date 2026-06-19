# NoteAPI — REST API Contracts

## Base URL

`http://localhost:3000` (default). Configurable via `PORT` environment variable for the server and `NOTEAPI_URL` for the CLI client.

## Data model

```typescript
interface Note {
  id: string;        // UUID v4, assigned on creation
  title: string;
  content: string;
  tags: string[];    // may be empty array
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## Endpoints

### GET /api/notes

List all notes. Supports optional query parameters:

| Parameter | Effect |
|-----------|--------|
| `tag` | Return only notes whose `tags` array contains the given value (case-sensitive exact match) |
| `q` | Full-text filter: return notes where title or content contains the query string (case-insensitive) |

Both parameters may be combined. An empty result set returns `[]` with status 200.

Response: `200 OK` with `Note[]`.

### GET /api/notes/:id

Retrieve a single note.

Response: `200 OK` with `Note`, or `404 Not Found` with `{ "error": "Note not found" }`.

### POST /api/notes

Create a note.

Request body:

```json
{ "title": "string (required)", "content": "string (required)", "tags": ["optional array"] }
```

Response: `201 Created` with the created `Note`.

Validation errors return `400 Bad Request` with `{ "error": "message" }`.

### PUT /api/notes/:id

Update an existing note. Partial updates are supported: supply only the fields you want to change.

Request body:

```json
{ "title": "optional", "content": "optional" }
```

Response: `200 OK` with the updated `Note`, or `404 Not Found`.

### DELETE /api/notes/:id

Delete a note.

Response: `204 No Content`, or `404 Not Found`.

### GET /health

Health check.

Response: `200 OK` with `{ "status": "ok" }`.

## Error envelope

All error responses use the shape:

```json
{ "error": "human-readable message" }
```

Raw error objects are never returned to the client.

## Storage

In-memory only. All data is lost on server restart. This is intentional — the project is a demo prop, not a production service.
