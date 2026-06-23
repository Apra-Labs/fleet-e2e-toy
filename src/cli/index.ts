#!/usr/bin/env node

/**
 * CLI entry point for fleet-e2e-toy.
 *
 * Parses process.argv, treats the first positional argument as the
 * subcommand, and dispatches to a handler. Each handler returns an exit
 * code (0 success, non-zero error). Subcommand handlers are added by
 * later tasks; this scaffold provides the dispatch and exit-code plumbing.
 */

import { listCommand } from "./commands/list";
import { readCommand } from "./commands/read";
import { createCommand } from "./commands/create";
import { updateCommand } from "./commands/update";
import { deleteCommand } from "./commands/delete";
import { VERSION } from "./version";
import { printHelp } from "./help";

type CommandHandler = (args: string[]) => Promise<number> | number;

// Handler map — subcommands are registered here as they are implemented.
const commands: Record<string, CommandHandler> = {
  list: listCommand,
  read: readCommand,
  create: createCommand,
  update: updateCommand,
  delete: deleteCommand,
};

async function run(argv: string[]): Promise<number> {
  // Global flags intercepted before subcommand dispatch.
  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  const [command, ...rest] = argv;

  // Help: per-command when a known subcommand precedes --help/-h, global otherwise.
  if (!command || argv.includes("--help") || argv.includes("-h")) {
    const subcommand =
      command && (argv.includes("--help") || argv.includes("-h"))
        ? command
        : undefined;
    printHelp(subcommand);
    return 0;
  }

  const handler = commands[command];
  if (!handler) {
    process.stderr.write(`Unknown command: ${command}\n`);
    return 1;
  }

  return handler(rest);
}

run(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
