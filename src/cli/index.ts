import { parseArgs } from "./args";
import { CliError, ExitCode } from "./client";
import { listCommand } from "./commands/list";
import { readCommand } from "./commands/read";
import { createCommand } from "./commands/create";
import { updateCommand } from "./commands/update";
import { deleteCommand } from "./commands/delete";
import { printGlobalHelp, printCommandHelp, GLOBAL_HELP } from "./help";
import { printVersion } from "./version";

/**
 * A subcommand handler receives the parsed flags and positional arguments
 * and performs the requested work, writing user-facing output to stdout.
 */
export type CommandHandler = (
  flags: Record<string, string | boolean>,
  positional: string[]
) => Promise<void> | void;

// Subcommand handlers are registered here by follow-up tasks.
const commands: Record<string, CommandHandler> = {
  list: listCommand,
  read: readCommand,
  create: createCommand,
  update: updateCommand,
  delete: deleteCommand,
};

export async function run(argv: string[]): Promise<number> {
  const { command, flags, positional } = parseArgs(argv);

  const helpRequested = flags["help"] === true || flags["h"] === true;
  const versionRequested = flags["version"] === true || flags["v"] === true;

  // Global --version / -v (short-circuits everything)
  if (versionRequested) {
    printVersion();
    return 0;
  }

  // Global --help / -h with no command
  if (!command) {
    if (helpRequested) {
      printGlobalHelp();
      return 0;
    }
    process.stderr.write("Error: no command provided\n\n");
    process.stderr.write(`${GLOBAL_HELP}\n`);
    return ExitCode.USAGE;
  }

  // Per-command --help / -h
  if (helpRequested) {
    printCommandHelp(command);
    return 0;
  }

  const handler = commands[command];
  if (!handler) {
    process.stderr.write(`Error: unknown command '${command}'\n\nRun 'noteapi --help' to see available commands.\n`);
    return ExitCode.USAGE;
  }

  try {
    await handler(flags, positional);
    return 0;
  } catch (err) {
    if (err instanceof CliError) {
      process.stderr.write(`${JSON.stringify({ error: err.message })}\n`);
      return err.exitCode;
    }
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`${JSON.stringify({ error: message })}\n`);
    return 1;
  }
}

async function main(): Promise<void> {
  const exitCode = await run(process.argv.slice(2));
  process.exitCode = exitCode;
}

// Only auto-run when executed directly, not when imported by tests.
if (require.main === module) {
  void main();
}
