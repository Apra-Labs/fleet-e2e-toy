import { ParsedArgs, getFlagString, hasFlag } from "../args";
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

function printListUsage(): void {
  const usage = `Usage: fleet-e2e-toy list [OPTIONS]

List all notes.

Options:
  --tag TAG      Filter by tag
  --q QUERY      Search by query string
  --help, -h     Show this help message
`;
  process.stdout.write(usage);
}

function printReadUsage(): void {
  const usage = `Usage: fleet-e2e-toy read [OPTIONS]

Read a note by ID.

Required options:
  --id ID        The ID of the note to read

Options:
  --help, -h     Show this help message
`;
  process.stdout.write(usage);
}

function printCreateUsage(): void {
  const usage = `Usage: fleet-e2e-toy create [OPTIONS]

Create a new note.

Required options:
  --title TITLE  The title of the note
  --content TEXT The content of the note

Options:
  --tags TAGS    Comma-separated list of tags
  --help, -h     Show this help message
`;
  process.stdout.write(usage);
}

function printUpdateUsage(): void {
  const usage = `Usage: fleet-e2e-toy update [OPTIONS]

Update an existing note.

Required options:
  --id ID        The ID of the note to update

Options:
  --title TITLE  New title for the note
  --content TEXT New content for the note
  --tags TAGS    Comma-separated list of tags
  --help, -h     Show this help message
`;
  process.stdout.write(usage);
}

function printDeleteUsage(): void {
  const usage = `Usage: fleet-e2e-toy delete [OPTIONS]

Delete a note.

Required options:
  --id ID        The ID of the note to delete

Options:
  --help, -h     Show this help message
`;
  process.stdout.write(usage);
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
  if (hasFlag(parsed.flags, "help", "h")) {
    printListUsage();
    return 0;
  }

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
  if (hasFlag(parsed.flags, "help", "h")) {
    printReadUsage();
    return 0;
  }

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
  if (hasFlag(parsed.flags, "help", "h")) {
    printCreateUsage();
    return 0;
  }

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
  if (hasFlag(parsed.flags, "help", "h")) {
    printUpdateUsage();
    return 0;
  }

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
  if (hasFlag(parsed.flags, "help", "h")) {
    printDeleteUsage();
    return 0;
  }

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
