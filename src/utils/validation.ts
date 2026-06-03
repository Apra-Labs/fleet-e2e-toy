import { CreateNoteInput, UpdateNoteInput } from "../models/note";

export interface ValidationError {
  field: string;
  message: string;
}

export function isBlankString(value: unknown): boolean {
  if (typeof value !== "string") {
    return true;
  }
  return value.trim().length === 0;
}

export function validateNonBlankString(value: unknown, field: string): ValidationError | null {
  if (isBlankString(value)) {
    return {
      field,
      message: `${field} must be a non-empty, non-whitespace string`,
    };
  }
  return null;
}

export function validateCreateInput(
  body: unknown
): { valid: true; data: CreateNoteInput } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: [{ field: "body", message: "Request body must be a JSON object" }] };
  }

  const obj = body as Record<string, unknown>;

  if (isBlankString(obj.title)) {
    errors.push({ field: "title", message: "Title is required and must be a non-empty string" });
  }

  if (typeof obj.content !== "string") {
    errors.push({ field: "content", message: "Content must be a string" });
  } else if (isBlankString(obj.content)) {
    errors.push({ field: "content", message: "Content must be a non-empty, non-whitespace string" });
  }

  if (obj.tags !== undefined) {
    if (!Array.isArray(obj.tags) || !obj.tags.every((t) => typeof t === "string")) {
      errors.push({ field: "tags", message: "Tags must be an array of strings" });
    } else if (obj.tags.some((t) => isBlankString(t))) {
      errors.push({ field: "tags", message: "Tags must not contain empty or whitespace-only strings" });
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: {
      title: (obj.title as string).trim(),
      content: obj.content as string,
      tags: ((obj.tags as string[] | undefined) ?? []).map((t) => t.trim()),
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

  if (obj.title !== undefined && isBlankString(obj.title)) {
    errors.push({ field: "title", message: "Title must be a non-empty string" });
  }

  if (obj.content !== undefined) {
    if (typeof obj.content !== "string") {
      errors.push({ field: "content", message: "Content must be a string" });
    } else if (isBlankString(obj.content)) {
      errors.push({ field: "content", message: "Content must be a non-empty, non-whitespace string" });
    }
  }

  if (obj.tags !== undefined) {
    if (!Array.isArray(obj.tags) || !obj.tags.every((t) => typeof t === "string")) {
      errors.push({ field: "tags", message: "Tags must be an array of strings" });
    } else if (obj.tags.some((t) => isBlankString(t))) {
      errors.push({ field: "tags", message: "Tags must not contain empty or whitespace-only strings" });
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  const data: UpdateNoteInput = {};
  if (obj.title !== undefined) data.title = (obj.title as string).trim();
  if (obj.content !== undefined) data.content = obj.content as string;
  if (obj.tags !== undefined) data.tags = (obj.tags as string[]).map((t) => t.trim());

  return { valid: true, data };
}

export function validateListQuery(
  query: Record<string, unknown>
): { valid: true; data: { tag?: string; q?: string } } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (query.tag !== undefined) {
    if (typeof query.tag !== "string") {
      errors.push({ field: "tag", message: "tag query parameter must be a non-empty, non-whitespace string" });
    } else if (isBlankString(query.tag)) {
      errors.push({ field: "tag", message: "tag query parameter must be a non-empty, non-whitespace string" });
    }
  }

  if (query.q !== undefined) {
    if (typeof query.q !== "string") {
      errors.push({ field: "q", message: "q query parameter must be a non-empty, non-whitespace string" });
    } else if (isBlankString(query.q)) {
      errors.push({ field: "q", message: "q query parameter must be a non-empty, non-whitespace string" });
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  const data: { tag?: string; q?: string } = {};
  if (query.tag !== undefined) data.tag = (query.tag as string).trim();
  if (query.q !== undefined) data.q = (query.q as string).trim();

  return { valid: true, data };
}

export function validateIdParam(id: unknown): ValidationError | null {
  if (isBlankString(id)) {
    return { field: "id", message: "id path parameter must be a non-empty, non-whitespace string" };
  }
  return null;
}
