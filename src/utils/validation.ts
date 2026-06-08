import { CreateNoteInput, UpdateNoteInput } from "../models/note";

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePaginationParams(
  page: unknown,
  limit: unknown
): { valid: true; params: { page: number; limit: number } } | { valid: false; error: string } {
  const pageNum = page === undefined ? 1 : Number(page);
  const limitNum = limit === undefined ? 10 : Number(limit);

  if (isNaN(pageNum) || !Number.isFinite(pageNum)) {
    return { valid: false, error: "page must be a valid number" };
  }

  if (isNaN(limitNum) || !Number.isFinite(limitNum)) {
    return { valid: false, error: "limit must be a valid number" };
  }

  const flooredPage = Math.floor(pageNum);
  const flooredLimit = Math.floor(limitNum);

  if (flooredPage < 1) {
    return { valid: false, error: "page must be at least 1" };
  }

  if (flooredLimit < 1) {
    return { valid: false, error: "limit must be at least 1" };
  }

  return { valid: true, params: { page: flooredPage, limit: flooredLimit } };
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
