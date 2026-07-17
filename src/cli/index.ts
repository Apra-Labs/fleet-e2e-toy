#!/usr/bin/env node
// NoteAPI CLI entrypoint.
//
// Reads argv, dispatches to a registered subcommand, and reports errors
// clearly (to stderr, without a stack trace) with a non-zero exit code.
//
// Subcommands and help text are intentionally NOT wired here yet — later
// tasks register commands via `registerCommand` (see commands.ts) and add
// the help extension point. This module provides the skeleton dispatch
// mechanism those tasks build on, plus the --version/-v flag.

import { getCommand, CommandContext } from "./commands";
import { ApiError } from "./http";
import packageJson from "../../package.json";

/** CLI display name used in the --version output. */
const CLI_NAME = "fleet-e2e-toy";

/** Print the CLI version string, sourced at runtime from package.json. */
function printVersion(): void {
  process.stdout.write(`${CLI_NAME} v${packageJson.version}\n`);
}

/**
 * Dispatch the given argv (already stripped of `node` and the script path).
 * Returns the process exit code. Never throws for expected error conditions
 * such as an unknown command — those resolve to a non-zero exit code after a
 * clear message is written to stderr.
 */
export async function dispatch(argv: string[]): Promise<number> {
  // --version/-v is recognized anywhere in argv, standalone or alongside a
  // subcommand, and short-circuits before any subcommand dispatch.
  if (argv.includes("--version") || argv.includes("-v")) {
    printVersion();
    return 0;
  }

  const [commandName, ...rest] = argv;

  // No subcommand given. Help wiring is a later task; for now signal misuse
  // clearly rather than doing nothing.
  if (!commandName) {
    process.stderr.write("Error: no command provided\n");
    return 1;
  }

  const command = getCommand(commandName);
  if (!command) {
    process.stderr.write(`Error: unknown command '${commandName}'\n`);
    return 1;
  }

  const ctx: CommandContext = { args: rest };

  try {
    const result = await command.run(ctx);
    return typeof result === "number" ? result : 0;
  } catch (err) {
    // Present a clear, single-line message — no stack trace.
    if (err instanceof ApiError) {
      process.stderr.write(`Error: ${err.message}\n`);
    } else if (err instanceof Error) {
      process.stderr.write(`Error: ${err.message}\n`);
    } else {
      process.stderr.write("Error: an unexpected error occurred\n");
    }
    return 1;
  }
}

/** Run the CLI against `process.argv` and set the process exit code. */
export async function main(): Promise<void> {
  const code = await dispatch(process.argv.slice(2));
  process.exitCode = code;
}

// Only run when invoked directly (not when imported by tests).
if (require.main === module) {
  void main();
}
