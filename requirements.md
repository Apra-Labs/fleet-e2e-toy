# Sprint Requirements

## Issue gh-toy-bzq: Tag Filtering Endpoint

The notes API must support filtering by tag via a query parameter. When a client sends `GET /api/notes?tag=work`, the response must contain only notes that have been tagged with "work". The endpoint is partially implemented and the primary remaining work is test coverage. Acceptance criteria: the tag filter query parameter is recognised and applied server-side; results contain only notes matching the given tag; notes without that tag are excluded; an unrecognised or absent tag returns an empty array rather than an error; existing tests continue to pass.

## Issue gh-toy-gw1: Full-Text Search

The notes API must support free-text search across note titles and content via a query parameter. When a client sends `GET /api/notes?q=meeting`, the response must contain only notes whose title or content contains the search term. The feature is partially implemented and edge cases need test coverage. Acceptance criteria: the `q` parameter triggers a case-insensitive search across both title and content fields; an empty `q` value returns all notes without error; a query with no matches returns an empty array; results are returned in a consistent order; existing tests continue to pass.

## Issue gh-toy-06i: Pagination Support

The notes API must support paginated retrieval of notes so that large collections can be consumed incrementally. When a client sends `GET /api/notes?page=1&limit=10`, the response must include a metadata envelope containing the paginated data and totals. Acceptance criteria: the `page` and `limit` query parameters are accepted and applied; the response body has the shape `{ data: [...], total: N, page: N, limit: N }`; `page` defaults to 1 and `limit` defaults to a sensible value when not supplied; requesting a page beyond the last returns an empty `data` array with correct `total`; existing tests continue to pass.
