#!/usr/bin/env node
// CLI entry point for NoteAPI.
//
// Parses argv, dispatches to a subcommand handler, and exits non-zero with a
// clean stderr message (no stack trace) on any failure or unknown command.
// Talks to the API exclusively through src/cli/client.ts.

import { ApiError } from "./cli/client";

export type Subcommand = "list" | "read" | "create" | "update" | "delete";

const SUBCOMMANDS: Subcommand[] = ["list", "read", "create", "update", "delete"];

function isSubcommand(value: string): value is Subcommand {
  return (SUBCOMMANDS as string[]).includes(value);
}

// Subcommand handlers. list/read/create/update/delete are stubs here — the
// CRUD task fills in the real implementations.
const handlers: Record<Subcommand, (args: string[]) => Promise<void>> = {
  async list(): Promise<void> {
    throw new Error("Command 'list' is not yet implemented");
  },
  async read(): Promise<void> {
    throw new Error("Command 'read' is not yet implemented");
  },
  async create(): Promise<void> {
    throw new Error("Command 'create' is not yet implemented");
  },
  async update(): Promise<void> {
    throw new Error("Command 'update' is not yet implemented");
  },
  async delete(): Promise<void> {
    throw new Error("Command 'delete' is not yet implemented");
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
