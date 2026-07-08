#!/usr/bin/env node
import fs from "fs";
import path from "path";

const TOOL_NAME = "fleet-e2e-toy";
const API_BASE_URL = process.env.NOTEAPI_URL ?? "http://localhost:3000";

const SUBCOMMANDS = ["list", "read", "create", "update", "delete"] as const;
type Subcommand = (typeof SUBCOMMANDS)[number];

export interface ParsedArgs {
  _: string[];
  flags: Record<string, string | boolean>;
}

/**
 * Minimal arg parser supporting:
 *   --flag=value
 *   --flag value
 *   --flag (boolean, no value follows or next token is another flag)
 *   -f shorthand (boolean)
 * Positional (non-flag) tokens are collected in `_`.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token.startsWith("--")) {
      const eqIndex = token.indexOf("=");
      if (eqIndex !== -1) {
        const key = token.slice(2, eqIndex);
        const value = token.slice(eqIndex + 1);
        flags[key] = value;
      } else {
        const key = token.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("-")) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (token.startsWith("-") && token.length > 1) {
      const key = token.slice(1);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(token);
    }
  }

  return { _: positional, flags };
}

export function getVersion(): string {
  const pkgPath = path.join(__dirname, "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version: string };
  return pkg.version;
}

export function getVersionString(): string {
  return `${TOOL_NAME} v${getVersion()}`;
}

export function hasVersionFlag(args: string[]): boolean {
  return args.includes("--version") || args.includes("-v");
}

export function hasHelpFlag(args: string[]): boolean {
  return args.includes("--help") || args.includes("-h");
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function getStringFlag(flags: Record<string, string | boolean>, name: string): string | undefined {
  const value = flags[name];
  if (value === undefined || typeof value === "boolean") return undefined;
  return value;
}

const GLOBAL_USAGE = `Usage: ${TOOL_NAME} <command> [options]

Commands:
  list      List notes, optionally filtered by tag or search query
  read      Read a single note by ID
  create    Create a new note
  update    Update an existing note
  delete    Delete a note by ID

Global Options:
  --version, -v   Print the tool version and exit
  --help, -h      Print this help message and exit

Run '${TOOL_NAME} <command> --help' for command-specific options.
`;

const SUBCOMMAND_USAGE: Record<Subcommand, string> = {
  list: `Usage: ${TOOL_NAME} list [options]

List notes, optionally filtered by tag or search query.

Options:
  --tag=<tag>    Filter notes by tag (optional)
  --q=<query>    Search notes by title/content (optional)
`,
  read: `Usage: ${TOOL_NAME} read --id=<id>

Read a single note by ID.

Options:
  --id=<id>      Note ID (required)
`,
  create: `Usage: ${TOOL_NAME} create --title=<title> --content=<content> [--tags=<t1,t2>]

Create a new note.

Options:
  --title=<title>      Note title (required)
  --content=<content>  Note content (required)
  --tags=<t1,t2>       Comma-separated list of tags (optional)
`,
  update: `Usage: ${TOOL_NAME} update --id=<id> [--title=<title>] [--content=<content>] [--tags=<t1,t2>]

Update an existing note. At least one of --title, --content, --tags is required.

Options:
  --id=<id>            Note ID (required)
  --title=<title>      New title (optional)
  --content=<content>  New content (optional)
  --tags=<t1,t2>       Comma-separated list of tags (optional)
`,
  delete: `Usage: ${TOOL_NAME} delete --id=<id>

Delete a note by ID.

Options:
  --id=<id>      Note ID (required)
`,
};

function isSubcommand(value: string | undefined): value is Subcommand {
  return value !== undefined && (SUBCOMMANDS as readonly string[]).includes(value);
}

class CliError extends Error {}

async function callApi(
  method: string,
  urlPath: string,
  body?: unknown
): Promise<{ status: number; data: unknown }> {
  const url = `${API_BASE_URL}${urlPath}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new CliError(`Could not connect to API at ${API_BASE_URL}`);
  }

  if (response.status === 204) {
    return { status: response.status, data: undefined };
  }

  const text = await response.text();
  let data: unknown = undefined;
  if (text.length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).error)
        : response.statusText;
    throw new CliError(message);
  }

  return { status: response.status, data };
}

function requireNonBlank(flags: Record<string, string | boolean>, name: string): string {
  const value = getStringFlag(flags, name);
  if (value === undefined) {
    throw new CliError(`--${name} is required`);
  }
  if (isBlank(value)) {
    throw new CliError(`--${name} cannot be empty or whitespace`);
  }
  return value;
}

function parseTags(flags: Record<string, string | boolean>): string[] | undefined {
  const raw = getStringFlag(flags, "tags");
  if (raw === undefined) return undefined;
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

async function runList(flags: Record<string, string | boolean>): Promise<unknown> {
  const params = new URLSearchParams();
  const tag = getStringFlag(flags, "tag");
  const q = getStringFlag(flags, "q");
  if (tag !== undefined && !isBlank(tag)) params.set("tag", tag);
  if (q !== undefined && !isBlank(q)) params.set("q", q);
  const qs = params.toString();
  const { data } = await callApi("GET", `/api/notes${qs ? `?${qs}` : ""}`);
  return data;
}

async function runRead(flags: Record<string, string | boolean>): Promise<unknown> {
  const id = requireNonBlank(flags, "id");
  const { data } = await callApi("GET", `/api/notes/${encodeURIComponent(id)}`);
  return data;
}

async function runCreate(flags: Record<string, string | boolean>): Promise<unknown> {
  const title = requireNonBlank(flags, "title");
  const content = requireNonBlank(flags, "content");
  const tags = parseTags(flags) ?? [];
  const { data } = await callApi("POST", "/api/notes", { title, content, tags });
  return data;
}

async function runUpdate(flags: Record<string, string | boolean>): Promise<unknown> {
  const id = requireNonBlank(flags, "id");

  const hasTitle = flags.title !== undefined;
  const hasContent = flags.content !== undefined;
  const hasTags = flags.tags !== undefined;

  if (!hasTitle && !hasContent && !hasTags) {
    throw new CliError("at least one of --title, --content, --tags is required");
  }

  const body: Record<string, unknown> = {};
  if (hasTitle) body.title = requireNonBlank(flags, "title");
  if (hasContent) body.content = requireNonBlank(flags, "content");
  if (hasTags) body.tags = parseTags(flags);

  const { data } = await callApi("PUT", `/api/notes/${encodeURIComponent(id)}`, body);
  return data;
}

async function runDelete(flags: Record<string, string | boolean>): Promise<unknown> {
  const id = requireNonBlank(flags, "id");
  const { data } = await callApi("DELETE", `/api/notes/${encodeURIComponent(id)}`);
  return data;
}

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function main(argv: string[]): Promise<CliResult> {
  let stdout = "";
  let stderr = "";

  const { _: positional, flags } = parseArgs(argv);
  const command = positional[0];

  // Per-subcommand help takes precedence when a valid subcommand is given
  if (isSubcommand(command) && hasHelpFlag(argv)) {
    stdout += SUBCOMMAND_USAGE[command];
    return { stdout, stderr, exitCode: 0 };
  }

  if (hasVersionFlag(argv)) {
    stdout += `${getVersionString()}\n`;
    return { stdout, stderr, exitCode: 0 };
  }

  if (hasHelpFlag(argv) || command === undefined) {
    stdout += GLOBAL_USAGE;
    return { stdout, stderr, exitCode: 0 };
  }

  if (!isSubcommand(command)) {
    stderr += `Error: unknown command '${command}'\n`;
    return { stdout, stderr, exitCode: 1 };
  }

  try {
    let result: unknown;
    switch (command) {
      case "list":
        result = await runList(flags);
        break;
      case "read":
        result = await runRead(flags);
        break;
      case "create":
        result = await runCreate(flags);
        break;
      case "update":
        result = await runUpdate(flags);
        break;
      case "delete":
        result = await runDelete(flags);
        break;
    }

    if (result === undefined) {
      stdout += "";
    } else {
      stdout += `${JSON.stringify(result, null, 2)}\n`;
    }
    return { stdout, stderr, exitCode: 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    stderr += `Error: ${message}\n`;
    return { stdout, stderr, exitCode: 1 };
  }
}

/* istanbul ignore next -- exercised only when run as a script */
if (require.main === module) {
  main(process.argv.slice(2)).then((result) => {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.exitCode);
  });
}
