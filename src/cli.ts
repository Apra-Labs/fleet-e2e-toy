// CLI entry point for the NoteAPI client ("fleet-e2e-toy").
//
// This is a standalone HTTP client that talks to an already-running NoteAPI
// server (see src/index.ts) over `fetch`. It does not touch the Express app,
// routes, or validation helpers in src/api or src/utils.

export type Flags = Record<string, string>;

export interface ParsedArgs {
  subcommand: string | undefined;
  flags: Flags;
}

/**
 * Parses argv (excluding `node` and script path) into a subcommand and a
 * flag map. Supports `--flag value` and `-x value` forms. A flag with no
 * following value (e.g. trailing `--flag`) is recorded with an empty string
 * value. The first non-flag token is treated as the subcommand.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  let subcommand: string | undefined;
  const flags: Flags = {};

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token.startsWith("--") || (token.startsWith("-") && token.length > 1 && !/^-\d/.test(token))) {
      const name = token.replace(/^-+/, "");
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags[name] = next;
        i++;
      } else {
        flags[name] = "";
      }
    } else if (subcommand === undefined) {
      subcommand = token;
    }
  }

  return { subcommand, flags };
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getBaseUrl(): string {
  return process.env.NOTEAPI_URL ?? "http://localhost:3000";
}

/**
 * Reusable HTTP helper for calling NoteAPI. Returns the parsed JSON body on
 * a 2xx response. On a non-2xx response or a network failure it throws an
 * ApiError with a clean message (no stack trace surfaced to the user).
 */
export async function apiRequest<T = unknown>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const method = init?.method ?? "GET";

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(`Request to ${url} failed: unable to reach NoteAPI server`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).error)
        : `NoteAPI request failed with status ${response.status}`;
    throw new ApiError(message);
  }

  return data as T;
}

export type SubcommandHandler = (flags: Flags) => Promise<unknown>;

const handlers: Record<string, SubcommandHandler> = {};

export function registerSubcommand(name: string, handler: SubcommandHandler): void {
  handlers[name] = handler;
}

function usageText(): string {
  return [
    "Usage: fleet-e2e-toy <subcommand> [flags]",
    "",
    "Subcommands:",
    "  list     [--tag <tag>] [--q <query>]",
    "  read     --id <id>",
    "  create   --title <title> --content <content> [--tags <csv>]",
    "  update   --id <id> [--title <title>] [--content <content>] [--tags <csv>]",
    "  delete   --id <id>",
    "",
    "Flags:",
    "  --help, -h       show usage",
    "  --version, -v    show version",
    "",
  ].join("\n");
}

const subcommandUsage: Record<string, string> = {
  list: [
    "Usage: fleet-e2e-toy list [--tag <tag>] [--q <query>]",
    "",
    "List notes, optionally filtered by tag and/or a full-text search query.",
    "",
    "Flags:",
    "  --tag <tag>      only return notes with this exact tag",
    "  --q <query>      only return notes whose title/content match this query",
    "",
  ].join("\n"),
  read: [
    "Usage: fleet-e2e-toy read --id <id>",
    "",
    "Fetch a single note by id.",
    "",
    "Flags:",
    "  --id <id>        (required) the note id to fetch",
    "",
  ].join("\n"),
  create: [
    "Usage: fleet-e2e-toy create --title <title> --content <content> [--tags <csv>]",
    "",
    "Create a new note.",
    "",
    "Flags:",
    "  --title <title>      (required) the note title",
    "  --content <content>  (required) the note content",
    "  --tags <csv>         comma-separated list of tags (default: [])",
    "",
  ].join("\n"),
  update: [
    "Usage: fleet-e2e-toy update --id <id> [--title <title>] [--content <content>] [--tags <csv>]",
    "",
    "Update an existing note. Only the provided fields are changed.",
    "",
    "Flags:",
    "  --id <id>            (required) the note id to update",
    "  --title <title>      new title",
    "  --content <content>  new content",
    "  --tags <csv>         comma-separated list of tags",
    "",
  ].join("\n"),
  delete: [
    "Usage: fleet-e2e-toy delete --id <id>",
    "",
    "Delete a note by id.",
    "",
    "Flags:",
    "  --id <id>        (required) the note id to delete",
    "",
  ].join("\n"),
};

function printUsage(): void {
  process.stderr.write(usageText());
}

function printHelp(): void {
  process.stdout.write(usageText());
}

function printSubcommandHelp(subcommand: string): void {
  process.stdout.write(subcommandUsage[subcommand] ?? usageText());
}

function printError(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(JSON.stringify({ error: message }, null, 2) + "\n");
}

/**
 * Throws a clean validation error (no stack trace surfaced) if `flags[name]`
 * is missing, empty, or whitespace-only. Returns the trimmed-checked value
 * (original, untrimmed string) otherwise.
 */
export function requireNonEmpty(flags: Flags, name: string): string {
  const value = flags[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Error: ${name} is required and must not be empty`);
  }
  return value;
}

/** Splits a comma-separated tags string into a trimmed, non-empty string array. */
export function splitTags(csv: string | undefined): string[] {
  if (!csv || !csv.trim()) return [];
  return csv
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Central runner: dispatches parsed args to the registered subcommand
 * handler. On any thrown error, prints a formatted { "error": "" } object
 * (pretty JSON) to stderr and exits 1, with no stack trace. An unknown
 * subcommand prints usage to stderr and exits 1.
 */
export async function run(argv: string[]): Promise<void> {
  const { subcommand, flags } = parseArgs(argv);

  const helpRequested = flags.help !== undefined || flags.h !== undefined;

  if (subcommand === undefined) {
    if (helpRequested) {
      printHelp();
      process.exitCode = 0;
      return;
    }
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (helpRequested) {
    printSubcommandHelp(subcommand);
    process.exitCode = 0;
    return;
  }

  const handler = handlers[subcommand];
  if (!handler) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    const result = await handler(flags);
    if (result !== undefined) {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    }
  } catch (err) {
    printError(err);
    process.exitCode = 1;
  }
}

// -- Subcommand handlers -----------------------------------------------------

registerSubcommand("list", async (flags: Flags) => {
  const params = new URLSearchParams();
  if (flags.tag) params.set("tag", flags.tag);
  if (flags.q) params.set("q", flags.q);
  const qs = params.toString();
  return apiRequest(qs ? `/api/notes?${qs}` : "/api/notes");
});

registerSubcommand("create", async (flags: Flags) => {
  const title = requireNonEmpty(flags, "title");
  const content = requireNonEmpty(flags, "content");
  const tags = splitTags(flags.tags);

  return apiRequest("/api/notes", {
    method: "POST",
    body: { title, content, tags },
  });
});

registerSubcommand("update", async (flags: Flags) => {
  const id = requireNonEmpty(flags, "id");

  const body: Record<string, unknown> = {};
  if (flags.title !== undefined) body.title = flags.title;
  if (flags.content !== undefined) body.content = flags.content;
  if (flags.tags !== undefined) body.tags = splitTags(flags.tags);

  return apiRequest(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body,
  });
});

/* istanbul ignore next -- exercised via the built CLI, not unit-imported */
if (require.main === module) {
  void run(process.argv.slice(2));
}
