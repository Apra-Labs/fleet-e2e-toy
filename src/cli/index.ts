import { parseArgs } from "./args";
import { CliError, ExitCode } from "./client";

const USAGE = `Usage: cli <command> [options]

Commands:
  (subcommands are added in follow-up work)

Run with a valid command to interact with the NoteAPI.`;

/**
 * A subcommand handler receives the parsed flags and positional arguments
 * and performs the requested work, writing user-facing output to stdout.
 */
export type CommandHandler = (
  flags: Record<string, string | boolean>,
  positional: string[]
) => Promise<void> | void;

// Subcommand handlers are registered here by follow-up tasks.
const commands: Record<string, CommandHandler> = {};

export async function run(argv: string[]): Promise<number> {
  const { command, flags, positional } = parseArgs(argv);

  if (!command) {
    process.stderr.write("Error: no command provided\n\n");
    process.stderr.write(`${USAGE}\n`);
    return ExitCode.USAGE;
  }

  const handler = commands[command];
  if (!handler) {
    process.stderr.write(`Error: unknown command '${command}'\n\n`);
    process.stderr.write(`${USAGE}\n`);
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
