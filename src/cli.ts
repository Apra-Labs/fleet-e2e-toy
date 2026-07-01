#!/usr/bin/env node
/**
 * NoteAPI CLI — foundation.
 *
 * Provides:
 *   - a global-flag + subcommand argument parser
 *   - a subcommand dispatcher (list/read/create/update/delete; stubs here)
 *   - an API client that resolves the base URL and performs requests via fetch
 *   - centralized error handling: human-readable stderr message, non-zero exit
 *
 * Later tasks flesh out the subcommand handlers, help text, and --version.
 */

const DEFAULT_BASE_URL = "http://localhost:3000";
const VERSION = "1.0.0";

const KNOWN_SUBCOMMANDS = ["list", "read", "create", "update", "delete"] as const;
type Subcommand = (typeof KNOWN_SUBCOMMANDS)[number];

/** Raised for expected, user-facing errors. Prints message to stderr, no stack. */
export class CliError extends Error {}

export interface ParsedArgs {
  /** Base URL from --url flag, or undefined if not provided. */
  url?: string;
  help: boolean;
  version: boolean;
  /** The resolved subcommand, or undefined if none was given. */
  subcommand?: string;
  /** Positional args and flags that follow the subcommand. */
  rest: string[];
}

/**
 * Split argv into global flags and a subcommand with its remaining args.
 *
 * Global flags (--url, --help/-h, --version/-v) may appear before the
 * subcommand. The first non-flag token is treated as the subcommand; every
 * token after it (flags included) is passed through untouched in `rest` so
 * per-subcommand parsing can own them.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { help: false, version: false, rest: [] };

  let i = 0;
  for (; i < argv.length; i++) {
    const arg = argv[i];

    // Once we hit the subcommand, the rest belongs to it.
    if (!arg.startsWith("-")) {
      parsed.subcommand = arg;
      parsed.rest = argv.slice(i + 1);
      break;
    }

    switch (arg) {
      case "--help":
      case "-h":
        parsed.help = true;
        break;
      case "--version":
      case "-v":
        parsed.version = true;
        break;
      case "--url": {
        const value = argv[i + 1];
        if (value === undefined || value.startsWith("-")) {
          throw new CliError("Missing value for --url");
        }
        parsed.url = value;
        i++;
        break;
      }
      default:
        if (arg.startsWith("--url=")) {
          parsed.url = arg.slice("--url=".length);
          break;
        }
        throw new CliError(`Unknown global flag: ${arg}`);
    }
  }

  return parsed;
}

/**
 * Resolve the API base URL: --url flag, then NOTEAPI_URL env var, then default.
 */
export function resolveBaseUrl(urlFlag?: string): string {
  const url = urlFlag ?? process.env.NOTEAPI_URL ?? DEFAULT_BASE_URL;
  return url.replace(/\/+$/, "");
}

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
}

/**
 * Perform an HTTP request against the NoteAPI and return the parsed JSON body.
 *
 * Network failures and non-2xx responses are surfaced as CliError with a
 * human-readable message (no stack traces).
 */
export async function apiRequest<T = unknown>(
  baseUrl: string,
  path: string,
  options: ApiRequestOptions = {}
): Promise<T | undefined> {
  const { method = "GET", body, query } = options;

  const url = new URL(baseUrl + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new CliError(`Could not reach NoteAPI at ${baseUrl}: ${reason}`);
  }

  const text = await response.text();
  let data: unknown;
  if (text.length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(data) ?? `HTTP ${response.status} ${response.statusText}`;
    throw new CliError(`Request failed (${response.status}): ${message}`);
  }

  return data as T | undefined;
}

/** Pull a readable message out of an API error body, if present. */
function extractErrorMessage(data: unknown): string | undefined {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === "string") return obj.error;
    if (Array.isArray(obj.errors)) return obj.errors.join(", ");
  }
  return undefined;
}

/** Context handed to each subcommand handler. */
export interface CommandContext {
  baseUrl: string;
  args: string[];
}

/**
 * Dispatch to the appropriate subcommand handler. Handlers are stubs at this
 * stage; later tasks implement the real behavior.
 */
export async function dispatch(subcommand: string, ctx: CommandContext): Promise<void> {
  if (!isKnownSubcommand(subcommand)) {
    throw new CliError(`Unknown command: ${subcommand}`);
  }

  // Stub handlers — filled in by the CRUD task (gh-toy-sal.2), which will use
  // ctx (base URL + args) to perform real requests.
  void ctx;
  process.stdout.write(`'${subcommand}' is not implemented yet\n`);
}

function isKnownSubcommand(value: string): value is Subcommand {
  return (KNOWN_SUBCOMMANDS as readonly string[]).includes(value);
}

/** Program entry point. Returns the process exit code. */
export async function main(argv: string[]): Promise<number> {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    return fail(err);
  }

  if (parsed.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  if (parsed.help || parsed.subcommand === undefined) {
    process.stdout.write(usage());
    // No subcommand with no help request is a usage error.
    return parsed.help ? 0 : parsed.subcommand === undefined ? 1 : 0;
  }

  const baseUrl = resolveBaseUrl(parsed.url);

  try {
    await dispatch(parsed.subcommand, { baseUrl, args: parsed.rest });
    return 0;
  } catch (err) {
    return fail(err);
  }
}

/** Write a human-readable error to stderr and return a non-zero exit code. */
function fail(err: unknown): number {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Error: ${message}\n`);
  return 1;
}

function usage(): string {
  return [
    "Usage: noteapi [--url <url>] <command> [args]",
    "",
    "Commands:",
    "  list      List notes",
    "  read      Read a single note",
    "  create    Create a note",
    "  update    Update a note",
    "  delete    Delete a note",
    "",
    "Global flags:",
    "  --url <url>    NoteAPI base URL (default: NOTEAPI_URL env or http://localhost:3000)",
    "  -h, --help     Show this help",
    "  -v, --version  Show version",
    "",
  ].join("\n");
}

// Only run when invoked directly (not when imported by tests).
if (require.main === module) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (err) => {
      // Safety net — should never happen since main() handles its own errors.
      process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
      process.exitCode = 1;
    }
  );
}
