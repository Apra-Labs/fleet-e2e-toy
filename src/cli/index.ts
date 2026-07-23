#!/usr/bin/env node
import { ApiError, createNote, deleteNote, getNote, listNotes, updateNote } from "./api-client";
import { TOP_LEVEL_USAGE, isSubcommand, subcommandUsage, getVersionString } from "./help";

interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean | string[]>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean | string[]> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h") {
      flags.help = true;
    } else if (arg === "-v") {
      flags.version = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (key === "version") {
        flags.version = true;
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          const existing = flags[key];
          if (existing !== undefined) {
            if (Array.isArray(existing)) {
              existing.push(next);
            } else if (typeof existing === "string") {
              flags[key] = [existing, next];
            } else {
              flags[key] = next;
            }
          } else {
            flags[key] = next;
          }
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

function asString(value: string | boolean | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asStringArray(value: string | boolean | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return undefined;
}

function printError(message: string): void {
  process.stderr.write(`${JSON.stringify({ error: message })}\n`);
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Validates that a required string flag is present and not empty/whitespace-only.
 * Returns the value on success, or undefined and prints an error if invalid.
 */
function requireNonBlankString(value: string | undefined, flagName: string): string | undefined {
  if (value === undefined) {
    printError(`Missing required flag --${flagName}`);
    return undefined;
  }
  if (isBlank(value)) {
    printError(`Flag --${flagName} must not be empty or whitespace-only`);
    return undefined;
  }
  return value;
}

/**
 * Validates that an optional string flag, if present, is not empty/whitespace-only.
 * Returns true if the value is valid (including when absent).
 */
function validateOptionalNonBlankString(value: string | undefined, flagName: string): boolean {
  if (value === undefined) return true;
  if (isBlank(value)) {
    printError(`Flag --${flagName} must not be empty or whitespace-only`);
    return false;
  }
  return true;
}

/**
 * Validates that an optional string-array flag (e.g. repeatable --tag), if present,
 * contains no empty/whitespace-only entries.
 */
function validateNonBlankStringArray(values: string[] | undefined, flagName: string): boolean {
  if (values === undefined) return true;
  if (values.some(isBlank)) {
    printError(`Flag --${flagName} must not be empty or whitespace-only`);
    return false;
  }
  return true;
}

async function runList(flags: Record<string, string | boolean | string[]>): Promise<number> {
  const tag = asString(flags.tag);
  const q = asString(flags.q);

  if (!validateOptionalNonBlankString(tag, "tag")) return 1;
  if (!validateOptionalNonBlankString(q, "q")) return 1;

  try {
    const notes = await listNotes({ tag, q });
    process.stdout.write(`${JSON.stringify(notes, null, 2)}\n`);
    return 0;
  } catch (err) {
    printError(err instanceof ApiError ? err.message : "Unexpected error while listing notes");
    return 1;
  }
}

async function runRead(flags: Record<string, string | boolean | string[]>): Promise<number> {
  const id = requireNonBlankString(asString(flags.id), "id");
  if (id === undefined) return 1;

  try {
    const note = await getNote(id);
    process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
    return 0;
  } catch (err) {
    printError(err instanceof ApiError ? err.message : "Unexpected error while reading note");
    return 1;
  }
}

async function runCreate(flags: Record<string, string | boolean | string[]>): Promise<number> {
  const title = requireNonBlankString(asString(flags.title), "title");
  if (title === undefined) return 1;

  const rawContent = asString(flags.content);
  if (rawContent === undefined) {
    printError("Missing required flag --content");
    return 1;
  }
  const content = requireNonBlankString(rawContent, "content");
  if (content === undefined) return 1;

  const tagsInput = asStringArray(flags.tag);
  if (!validateNonBlankStringArray(tagsInput, "tag")) return 1;
  const tags = tagsInput ?? [];

  try {
    const note = await createNote({ title, content, tags });
    process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
    return 0;
  } catch (err) {
    printError(err instanceof ApiError ? err.message : "Unexpected error while creating note");
    return 1;
  }
}

async function runUpdate(flags: Record<string, string | boolean | string[]>): Promise<number> {
  const id = requireNonBlankString(asString(flags.id), "id");
  if (id === undefined) return 1;

  const title = asString(flags.title);
  const content = asString(flags.content);
  const tags = asStringArray(flags.tag);

  if (!validateOptionalNonBlankString(title, "title")) return 1;
  if (!validateOptionalNonBlankString(content, "content")) return 1;
  if (!validateNonBlankStringArray(tags, "tag")) return 1;

  const updates: { title?: string; content?: string; tags?: string[] } = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (tags !== undefined) updates.tags = tags;

  try {
    const note = await updateNote(id, updates);
    process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
    return 0;
  } catch (err) {
    printError(err instanceof ApiError ? err.message : "Unexpected error while updating note");
    return 1;
  }
}

async function runDelete(flags: Record<string, string | boolean | string[]>): Promise<number> {
  const id = requireNonBlankString(asString(flags.id), "id");
  if (id === undefined) return 1;

  try {
    await deleteNote(id);
    process.stdout.write(`${JSON.stringify({ message: `Note ${id} deleted` })}\n`);
    return 0;
  } catch (err) {
    printError(err instanceof ApiError ? err.message : "Unexpected error while deleting note");
    return 1;
  }
}

export async function main(argv: string[]): Promise<number> {
  const { positional, flags } = parseArgs(argv);
  const versionRequested = flags.version === true;

  if (versionRequested) {
    process.stdout.write(`${getVersionString()}\n`);
    return 0;
  }

  const command = positional[0];
  const helpRequested = flags.help === true;

  if (command === undefined || command.length === 0) {
    process.stdout.write(`${TOP_LEVEL_USAGE}\n`);
    return 0;
  }

  if (!isSubcommand(command)) {
    printError(`Unknown command '${command}'. Expected one of: list, read, create, update, delete.`);
    process.stderr.write(`${TOP_LEVEL_USAGE}\n`);
    return 1;
  }

  if (helpRequested) {
    process.stdout.write(`${subcommandUsage(command)}\n`);
    return 0;
  }

  switch (command) {
    case "list":
      return runList(flags);
    case "read":
      return runRead(flags);
    case "create":
      return runCreate(flags);
    case "update":
      return runUpdate(flags);
    case "delete":
      return runDelete(flags);
  }
}

/* istanbul ignore next -- entry point only runs when invoked as a script */
if (require.main === module) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch(() => {
      printError("Unexpected internal error");
      process.exitCode = 1;
    });
}
