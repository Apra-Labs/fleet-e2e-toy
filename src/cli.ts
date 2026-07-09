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

function printUsage(): void {
  process.stderr.write(
    [
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
    ].join("\n")
  );
}

function printError(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(JSON.stringify({ error: message }, null, 2) + "\n");
}

/**
 * Central runner: dispatches parsed args to the registered subcommand
 * handler. On any thrown error, prints a formatted { "error": "" } object
 * (pretty JSON) to stderr and exits 1, with no stack trace. An unknown
 * subcommand prints usage to stderr and exits 1.
 */
export async function run(argv: string[]): Promise<void> {
  const { subcommand, flags } = parseArgs(argv);

  if (subcommand === undefined) {
    printUsage();
    process.exitCode = 1;
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

/* istanbul ignore next -- exercised via the built CLI, not unit-imported */
if (require.main === module) {
  void run(process.argv.slice(2));
}
