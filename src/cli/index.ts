import { parseArgs } from "./parser";
import { CommandResult, ParsedArgs } from "./types";
import { getVersionString } from "./version";

/**
 * Dispatch a parsed command to its handler.
 *
 * For now no subcommands are registered; unknown (or missing) commands
 * produce a non-zero result. Later tasks add real subcommands here.
 */
function dispatch(parsed: ParsedArgs): CommandResult {
  const { command } = parsed;

  if (command === undefined) {
    return {
      code: 1,
      stderr: JSON.stringify({ error: "No command provided" }),
    };
  }

  return {
    code: 1,
    stderr: JSON.stringify({ error: `Unknown command: ${command}` }),
  };
}

/**
 * CLI entrypoint. Parses argv, dispatches to a command, and returns a
 * numeric process exit code. Never throws to the top level — any error is
 * caught and converted into a non-zero exit code with a structured message.
 */
export async function main(argv: string[]): Promise<number> {
  try {
    const parsed = parseArgs(argv);

    // Check for --version or -v flag before dispatching to any command
    if (parsed.flags.version === true || parsed.flags.v === true) {
      const versionString = getVersionString();
      process.stdout.write(versionString + "\n");
      return 0;
    }

    const result = dispatch(parsed);

    if (result.stdout !== undefined) {
      process.stdout.write(result.stdout + "\n");
    }
    if (result.stderr !== undefined) {
      process.stderr.write(result.stderr + "\n");
    }

    return result.code;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(JSON.stringify({ error: message }) + "\n");
    return 1;
  }
}
