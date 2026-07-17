#!/usr/bin/env node
// CLI entry point for NoteAPI.
//
// Parses argv, dispatches to a subcommand handler, and exits non-zero with a
// clean stderr message (no stack trace) on any failure or unknown command.
// Talks to the API exclusively through src/cli/client.ts.

import { notesClient, ApiError } from "./cli/client";
import { validateTitle, validateContent, validateId } from "./cli/validate";

export type Subcommand = "list" | "read" | "create" | "update" | "delete";

const SUBCOMMANDS: Subcommand[] = ["list", "read", "create", "update", "delete"];

function isSubcommand(value: string): value is Subcommand {
  return (SUBCOMMANDS as string[]).includes(value);
}

// Parses a flat list of "--flag value" pairs into a lookup map. A flag with
// no following value (or followed by another flag) maps to undefined so
// validators can report it as missing rather than throwing here.
function parseFlags(args: string[]): Record<string, string | undefined> {
  const flags: Record<string, string | undefined> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;
    const name = arg.slice(2);
    const next = args[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[name] = next;
      i++;
    } else {
      flags[name] = undefined;
    }
  }
  return flags;
}

// Splits a comma-separated --tags value into a trimmed, non-empty tag list.
// Returns [] when the flag was not supplied.
function parseTags(value: string | undefined): string[] {
  if (value === undefined) return [];
  return value
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function printResult(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

// Subcommand handlers. Each parses its own flags, validates required
// arguments before making any HTTP call, and prints results to stdout.
const handlers: Record<Subcommand, (args: string[]) => Promise<void>> = {
  async list(args: string[]): Promise<void> {
    const flags = parseFlags(args);
    const notes = await notesClient.list({ tag: flags.tag, q: flags.q });
    printResult(notes);
  },
  async read(args: string[]): Promise<void> {
    const flags = parseFlags(args);
    const id = validateId(flags.id);
    const note = await notesClient.getById(id);
    printResult(note);
  },
  async create(args: string[]): Promise<void> {
    const flags = parseFlags(args);
    const title = validateTitle(flags.title);
    const content = validateContent(flags.content);
    const tags = parseTags(flags.tags);
    const note = await notesClient.create({ title, content, tags });
    printResult(note);
  },
  async update(args: string[]): Promise<void> {
    const flags = parseFlags(args);
    const id = validateId(flags.id);
    const payload: { title?: string; content?: string; tags?: string[] } = {};
    if (flags.title !== undefined) payload.title = validateTitle(flags.title);
    if (flags.content !== undefined) payload.content = validateContent(flags.content);
    if (flags.tags !== undefined) payload.tags = parseTags(flags.tags);
    const note = await notesClient.update(id, payload);
    printResult(note);
  },
  async delete(args: string[]): Promise<void> {
    const flags = parseFlags(args);
    const id = validateId(flags.id);
    await notesClient.remove(id);
    printResult({ id, deleted: true });
  },
};

// Extracts a clean, single-line message from any thrown value. Never leaks a
// stack trace to the caller.
function cleanMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function run(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;

  if (!command) {
    process.stderr.write("Usage: noteapi-cli <command> [options]\n");
    process.stderr.write(`Commands: ${SUBCOMMANDS.join(", ")}\n`);
    return 1;
  }

  if (!isSubcommand(command)) {
    process.stderr.write(`Unknown command: ${command}\n`);
    process.stderr.write(`Commands: ${SUBCOMMANDS.join(", ")}\n`);
    return 1;
  }

  try {
    await handlers[command](rest);
    return 0;
  } catch (err) {
    process.stderr.write(`${cleanMessage(err)}\n`);
    return 1;
  }
}

/* istanbul ignore next -- exercised via process invocation, not unit tests */
if (require.main === module) {
  const argv = process.argv.slice(2);
  run(argv).then((code) => {
    process.exitCode = code;
  });
}
