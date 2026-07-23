#!/usr/bin/env node
import { ApiError, getNote, listNotes } from "./api-client";

interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

function printError(message: string): void {
  process.stderr.write(`${JSON.stringify({ error: message })}\n`);
}

async function runList(flags: Record<string, string | boolean>): Promise<number> {
  const tag = typeof flags.tag === "string" ? flags.tag : undefined;
  const q = typeof flags.q === "string" ? flags.q : undefined;

  try {
    const notes = await listNotes({ tag, q });
    process.stdout.write(`${JSON.stringify(notes, null, 2)}\n`);
    return 0;
  } catch (err) {
    printError(err instanceof ApiError ? err.message : "Unexpected error while listing notes");
    return 1;
  }
}

async function runRead(flags: Record<string, string | boolean>): Promise<number> {
  const id = typeof flags.id === "string" ? flags.id : undefined;
  if (!id) {
    printError("Missing required flag --id");
    return 1;
  }

  try {
    const note = await getNote(id);
    process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
    return 0;
  } catch (err) {
    printError(err instanceof ApiError ? err.message : "Unexpected error while reading note");
    return 1;
  }
}

export async function main(argv: string[]): Promise<number> {
  const { positional, flags } = parseArgs(argv);
  const command = positional[0];

  switch (command) {
    case "list":
      return runList(flags);
    case "read":
      return runRead(flags);
    default:
      printError(`Unknown command '${command ?? ""}'. Expected 'list' or 'read'.`);
      return 1;
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
