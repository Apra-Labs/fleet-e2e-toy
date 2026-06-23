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
import { VERSION } from "./version";

const USAGE = "Usage: fleet-e2e-toy <command> [options]";

type CommandHandler = (args: string[]) => Promise<number> | number;

// Handler map — subcommands are registered here as they are implemented.
const commands: Record<string, CommandHandler> = {
  list: listCommand,
  read: readCommand,
};

async function run(argv: string[]): Promise<number> {
  // Global flags intercepted before subcommand dispatch.
  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  const [command, ...rest] = argv;

  if (!command) {
    process.stderr.write(`${USAGE}\n`);
    return 1;
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
