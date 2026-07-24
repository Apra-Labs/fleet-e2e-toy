#!/usr/bin/env node
import { commands, CommandIO } from "./commands";
import { ApiError } from "./client";

const USAGE = `Usage: noteapi <command> [options]

Commands:
  list     List notes (optional --tag, --q filters)
  read     Read a note (--id required)
  create   Create a note (--title, --content required)
  update   Update a note (--id required; --title, --content optional)
  delete   Delete a note (--id required)

Environment:
  NOTEAPI_URL  Base URL of the NoteAPI server (default http://localhost:3000)`;

// Dispatch argv to the matching subcommand handler. Returns a process exit code.
export async function run(argv: string[], io: CommandIO): Promise<number> {
  const [name, ...rest] = argv;

  if (!name || name === "--help" || name === "-h" || name === "help") {
    io.out(USAGE);
    return name ? 0 : 1;
  }

  const handler = commands[name];
  if (!handler) {
    io.err(`unknown command: ${name}`);
    io.err(USAGE);
    return 1;
  }

  try {
    return await handler(rest, io);
  } catch (err) {
    if (err instanceof ApiError) {
      io.err(`error: ${err.message}`);
      return 1;
    }
    const detail = err instanceof Error ? err.message : String(err);
    io.err(`error: ${detail}`);
    return 1;
  }
}

async function main(): Promise<void> {
  const io: CommandIO = {
    out: (line: string) => process.stdout.write(`${line}\n`),
    err: (line: string) => process.stderr.write(`${line}\n`),
  };
  const code = await run(process.argv.slice(2), io);
  process.exitCode = code;
}

// Only run when invoked directly (not when imported by tests).
if (require.main === module) {
  void main();
}
