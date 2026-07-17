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
import { isHelpFlag, renderGlobalHelp, renderCommandHelp } from "./help";
import packageJson from "../../package.json";

// Register the CRUD subcommands for their side effect (each module calls
// registerCommand at load time). Importing here means both the CLI binary and
// the test suite (which imports `dispatch` from this module) see the same set
// of dispatchable commands with no separate wiring.
import "./notesRead";

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

  // No subcommand given, or `--help`/`-h` as the sole or leading arg: print the
  // global usage (listing the registered commands) and exit successfully. No
  // network call is made on any help path.
  if (!commandName || isHelpFlag(commandName)) {
    process.stdout.write(renderGlobalHelp());
    return 0;
  }

  const command = getCommand(commandName);
  if (!command) {
    // Unknown command — clear message, non-zero exit, no stack trace. This also
    // covers `<bogus> --help`: there is no usage to show for a command that
    // does not exist.
    process.stderr.write(`Error: unknown command '${commandName}'\n`);
    return 1;
  }

  // `<command> --help`/`-h`: print that command's usage and exit before running
  // it, so help never triggers a network request.
  if (rest.some((arg) => isHelpFlag(arg))) {
    process.stdout.write(renderCommandHelp(command));
    return 0;
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
