#!/usr/bin/env node
/**
 * CLI entry point for the NoteAPI command-line client.
 *
 * Parses argv into a subcommand name and a flags object, then dispatches
 * to the matching command handler. Unknown commands and missing commands
 * both exit non-zero with a clean error (no stack traces).
 */

export interface CliFlags {
  [key: string]: string | boolean;
}

export type CommandHandler = (flags: CliFlags) => Promise<void> | void;

/**
 * Registry of subcommand name -> handler. Later tasks register their
 * handlers here (list, read, create, update, delete).
 */
const commands: Record<string, CommandHandler> = {};

export function registerCommand(name: string, handler: CommandHandler): void {
  commands[name] = handler;
}

/**
 * Parses CLI arguments (excluding node and script path) into a subcommand
 * name and a flags object. Supports both `--key value` and `--key=value`
 * forms. Flags without a following value (or followed by another flag)
 * are treated as booleans set to `true`.
 */
export function parseArgs(argv: string[]): { command: string | undefined; flags: CliFlags } {
  const [command, ...rest] = argv;
  const flags: CliFlags = {};

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (!arg.startsWith("--")) {
      continue;
    }

    const eqIndex = arg.indexOf("=");
    if (eqIndex !== -1) {
      const key = arg.slice(2, eqIndex);
      const value = arg.slice(eqIndex + 1);
      flags[key] = value;
      continue;
    }

    const key = arg.slice(2);
    const next = rest[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }

  return { command, flags };
}

function printUsage(): void {
  process.stderr.write(
    [
      "Usage: fleet-e2e-toy <command> [flags]",
      "",
      "Commands:",
      "  list      List notes",
      "  read      Read a note",
      "  create    Create a note",
      "  update    Update a note",
      "  delete    Delete a note",
      "",
      "Run 'fleet-e2e-toy <command> --help' for command-specific usage.",
    ].join("\n") + "\n"
  );
}

export async function run(argv: string[]): Promise<void> {
  const { command, flags } = parseArgs(argv);

  if (!command) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const handler = commands[command];
  if (!handler) {
    process.stderr.write(`Error: unknown command '${command}'\n`);
    process.exitCode = 1;
    return;
  }

  try {
    await handler(flags);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

/* istanbul ignore next -- exercised via the compiled CLI, not unit tests */
if (require.main === module) {
  void run(process.argv.slice(2));
}
