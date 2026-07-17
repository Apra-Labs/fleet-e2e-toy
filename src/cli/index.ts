// NoteAPI CLI entrypoint.
//
// Reads argv, dispatches to a registered subcommand, and reports errors
// clearly (to stderr, without a stack trace) with a non-zero exit code.
//
// Subcommands, help text, and --version are intentionally NOT wired here yet —
// later tasks register commands via `registerCommand` (see commands.ts) and
// add the help/version extension points. This module only provides the
// skeleton dispatch mechanism those tasks build on.

import { getCommand, CommandContext } from "./commands";
import { ApiError } from "./http";

/**
 * Dispatch the given argv (already stripped of `node` and the script path).
 * Returns the process exit code. Never throws for expected error conditions
 * such as an unknown command — those resolve to a non-zero exit code after a
 * clear message is written to stderr.
 */
export async function dispatch(argv: string[]): Promise<number> {
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
