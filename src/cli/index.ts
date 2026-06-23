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

const TOOL_NAME = "fleet-e2e-toy";

/** A subcommand handler returns the desired process exit code. */
export type CommandHandler = (args: ParsedArgs) => number;

/** Dispatch table mapping subcommand names to their handlers. */
export const commands: Record<string, CommandHandler> = {};

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

  if (parsed.command === undefined) {
    printUsage();
    return 1;
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
