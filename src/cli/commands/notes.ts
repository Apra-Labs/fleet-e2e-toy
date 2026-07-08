import { ParsedArgs, getFlagString } from "../args";
import { apiRequest, ApiError, NetworkError } from "../api-client";
import { validateReadArgs, validateDeleteArgs, validateCreateArgs, validateUpdateArgs } from "../validate";

export interface CommandResult {
  code: number;
}

function printSuccess(data: unknown): void {
  if (data === null || data === undefined) {
    process.stdout.write("\n");
    return;
  }
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

function printError(message: string): void {
  process.stderr.write(`Error: ${message}\n`);
}

function handleError(err: unknown): number {
  if (err instanceof ApiError) {
    printError(err.message);
    return 1;
  }
  if (err instanceof NetworkError) {
    printError(`Could not connect to API at ${err.url}`);
    return 1;
  }
  printError(err instanceof Error ? err.message : String(err));
  return 1;
}

function parseTags(tagsFlag: string | undefined): string[] | undefined {
  if (tagsFlag === undefined) return undefined;
  return tagsFlag
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export async function runList(parsed: ParsedArgs): Promise<number> {
  const tag = getFlagString(parsed.flags, "tag");
  const q = getFlagString(parsed.flags, "q");

  const params = new URLSearchParams();
  if (tag !== undefined) params.set("tag", tag);
  if (q !== undefined) params.set("q", q);
  const qs = params.toString();
  const path = `/api/notes${qs ? `?${qs}` : ""}`;

  try {
    const result = await apiRequest(path, { method: "GET" });
    printSuccess(result.data);
    return 0;
  } catch (err) {
    return handleError(err);
  }
}

export async function runRead(parsed: ParsedArgs): Promise<number> {
  const id = getFlagString(parsed.flags, "id");

  const validation = validateReadArgs(id);
  if (!validation.valid) {
    printError(validation.message);
    return 1;
  }

  try {
    const result = await apiRequest(`/api/notes/${encodeURIComponent(id as string)}`, { method: "GET" });
    printSuccess(result.data);
    return 0;
  } catch (err) {
    return handleError(err);
  }
}

export async function runCreate(parsed: ParsedArgs): Promise<number> {
  const title = getFlagString(parsed.flags, "title");
  const content = getFlagString(parsed.flags, "content");
  const tags = parseTags(getFlagString(parsed.flags, "tags"));

  const validation = validateCreateArgs(title, content);
  if (!validation.valid) {
    printError(validation.message);
    return 1;
  }

  const body: Record<string, unknown> = { title, content };
  if (tags !== undefined) body.tags = tags;

  try {
    const result = await apiRequest("/api/notes", { method: "POST", body });
    printSuccess(result.data);
    return 0;
  } catch (err) {
    return handleError(err);
  }
}

export async function runUpdate(parsed: ParsedArgs): Promise<number> {
  const id = getFlagString(parsed.flags, "id");
  const title = getFlagString(parsed.flags, "title");
  const content = getFlagString(parsed.flags, "content");
  const tagsFlag = getFlagString(parsed.flags, "tags");
  const tags = parseTags(tagsFlag);

  const validation = validateUpdateArgs(id, title, content, tagsFlag);
  if (!validation.valid) {
    printError(validation.message);
    return 1;
  }

  const body: Record<string, unknown> = {};
  if (title !== undefined) body.title = title;
  if (content !== undefined) body.content = content;
  if (tags !== undefined) body.tags = tags;

  try {
    const result = await apiRequest(`/api/notes/${encodeURIComponent(id as string)}`, {
      method: "PUT",
      body,
    });
    printSuccess(result.data);
    return 0;
  } catch (err) {
    return handleError(err);
  }
}

export async function runDelete(parsed: ParsedArgs): Promise<number> {
  const id = getFlagString(parsed.flags, "id");

  const validation = validateDeleteArgs(id);
  if (!validation.valid) {
    printError(validation.message);
    return 1;
  }

  try {
    const result = await apiRequest(`/api/notes/${encodeURIComponent(id as string)}`, { method: "DELETE" });
    printSuccess(result.data);
    return 0;
  } catch (err) {
    return handleError(err);
  }
}
