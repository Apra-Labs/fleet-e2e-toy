import { CreateNoteInput, UpdateNoteInput } from "../models/note";

export interface ValidationError {
  field: string;
  message: string;
}

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

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function validatePaginationQuery(
  query: Record<string, unknown>
): { valid: true; page: number; limit: number } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const parse = (value: unknown): number | undefined => {
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return undefined;
    return Number(value);
  };

  let page = DEFAULT_PAGE;
  if (query.page !== undefined) {
    const p = parse(query.page);
    if (p === undefined) errors.push({ field: "page", message: "page must be a positive integer" });
    else page = p;
  }

  let limit = DEFAULT_LIMIT;
  if (query.limit !== undefined) {
    const l = parse(query.limit);
    if (l === undefined) errors.push({ field: "limit", message: "limit must be a positive integer" });
    else if (l > MAX_LIMIT) errors.push({ field: "limit", message: `limit must be at most ${MAX_LIMIT}` });
    else limit = l;
  }

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, page, limit };
}
