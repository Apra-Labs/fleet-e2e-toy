/**
 * Entry point for the fleet-e2e-toy CLI.
 *
 * Reads process.argv, parses it into a structured form, and dispatches to a
 * subcommand handler via a dispatch table. Subcommand logic itself is added
 * by later tasks; for now the dispatch table is empty and any command falls
 * through to the "unknown command" path.
 *
 * Errors are always reported as plain messages on stderr — never raw Error
 * objects and never stack traces — and the process exit code is set to a
 * non-zero value on any failure.
 */

import { ParsedArgs, parseArgs } from "./args";
import { printHelp } from "./help";
import { printVersion } from "./version";
import { listCommand } from "./commands/list";
import { readCommand } from "./commands/read";

const TOOL_NAME = "fleet-e2e-toy";

/** A subcommand handler returns the desired process exit code. */
export type CommandHandler = (args: ParsedArgs) => number;

/** Dispatch table mapping subcommand names to their handlers. */
export const commands: Record<string, CommandHandler> = {
  list: listCommand,
  read: readCommand,
};

function printUsage(): void {
  process.stderr.write(
    `Usage: ${TOOL_NAME} <command> [options]\n` +
      `Run '${TOOL_NAME} --help' for available commands.\n`
  );
}

function printError(message: string): void {
  process.stderr.write(`${message}\n`);
}

/**
 * Run the CLI for a given set of raw arguments (already stripped of the node
 * executable and script path). Returns the intended process exit code.
 */
export function run(argv: string[]): number {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(argv);
  } catch {
    printError("Error: failed to parse arguments");
    return 1;
  }

  // --version / -v takes precedence over everything else (including subcommands)
  if (parsed.flags["version"] === true || parsed.flags["v"] === true) {
    printVersion();
    return 0;
  }

  // --help / -h: global help when no command, per-subcommand help when combined
  if (parsed.flags["help"] === true || parsed.flags["h"] === true) {
    printHelp(parsed.command);
    return 0;
  }

  if (parsed.command === undefined) {
    printHelp();
    return 0;
  }

  const handler = commands[parsed.command];
  if (handler === undefined) {
    printError(`Unknown command: ${parsed.command}`);
    printUsage();
    return 1;
  }

  try {
    return handler(parsed);
  } catch {
    printError(`Error: command '${parsed.command}' failed`);
    return 1;
  }
}

process.exitCode = run(process.argv.slice(2));
