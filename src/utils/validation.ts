import { CreateNoteInput, UpdateNoteInput } from "../models/note";

/**
 * A single validation failure. Failures are collected into the `errors` array returned by
 * `validateCreateInput` and `validateUpdateInput` when `valid` is `false`.
 */
export interface ValidationError {
  /**
   * The input key that failed: `title`, `content` or `tags`. Set to `body` when the whole
   * request body is rejected because it is not a JSON object.
   */
  field: string;
  /**
   * Human-readable reason for the failure, safe to return to the client.
   */
  message: string;
}

export const MAX_TITLE_LENGTH = 100;

export function validateCreateInput(
  body: unknown
): { valid: true; data: CreateNoteInput } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: [{ field: "body", message: "Request body must be a JSON object" }] };
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj.title !== "string" || obj.title.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required and must be a non-empty string" });
  } else if (obj.title.trim().length > MAX_TITLE_LENGTH) {
    errors.push({ field: "title", message: `Title must be at most ${MAX_TITLE_LENGTH} characters` });
  }

  if (typeof obj.content !== "string") {
    errors.push({ field: "content", message: "Content must be a string" });
  }

  if (obj.tags !== undefined) {
    if (!Array.isArray(obj.tags) || !obj.tags.every((t) => typeof t === "string")) {
      errors.push({ field: "tags", message: "Tags must be an array of strings" });
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: {
      title: (obj.title as string).trim(),
      content: obj.content as string,
      tags: (obj.tags as string[] | undefined) ?? [],
    },
  };
}

/**
 * Validates the body of an update (PUT/PATCH) request for a note.
 *
 * All three fields are optional; each check runs only when its field is not `undefined`:
 * - `title`: if present, must be a string that is non-empty after trimming. There is no
 *   maximum length on update; `MAX_TITLE_LENGTH` (100) applies to create only.
 * - `content`: if present, must be a string. An empty string is allowed.
 * - `tags`: if present, must be an array whose elements are all strings.
 *
 * A falsy or non-object body (for example `null` or `undefined`) is rejected immediately
 * with a single error on field `body`. Otherwise all field errors are collected and
 * returned together.
 *
 * An empty object `{}` is currently accepted as a no-op update.
 *
 * On success, `data` contains only the supplied fields, with `title` trimmed.
 *
 * @param body - The parsed request body to validate; may be any value.
 * @returns `{ valid: true, data }` when the body is acceptable, otherwise
 *   `{ valid: false, errors }` with one or more `ValidationError` entries.
 */
export function validateUpdateInput(
  body: unknown
): { valid: true; data: UpdateNoteInput } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: [{ field: "body", message: "Request body must be a JSON object" }] };
  }

  const obj = body as Record<string, unknown>;

  if (obj.title !== undefined && (typeof obj.title !== "string" || obj.title.trim().length === 0)) {
    errors.push({ field: "title", message: "Title must be a non-empty string" });
  }

  if (obj.content !== undefined && typeof obj.content !== "string") {
    errors.push({ field: "content", message: "Content must be a string" });
  }

  if (obj.tags !== undefined) {
    if (!Array.isArray(obj.tags) || !obj.tags.every((t) => typeof t === "string")) {
      errors.push({ field: "tags", message: "Tags must be an array of strings" });
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  const data: UpdateNoteInput = {};
  if (obj.title !== undefined) data.title = (obj.title as string).trim();
  if (obj.content !== undefined) data.content = obj.content as string;
  if (obj.tags !== undefined) data.tags = obj.tags as string[];

  return { valid: true, data };
}
