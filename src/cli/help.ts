// Help text rendering for the NoteAPI CLI.
//
// Two forms of help are produced:
//   - Global usage: a synopsis plus the list of registered subcommands, sourced
//     live from the command registry (see commands.ts) so it never drifts from
//     what is actually dispatchable.
//   - Per-subcommand usage: the command's own `usage` string plus its
//     description.
//
// These renderers are pure (they build and return strings) so they can be
// unit-tested without spying on stdout. index.ts writes the result and picks
// the exit code.

import { Command, listCommands } from "./commands";

/** CLI display name used in usage synopsis lines. */
export const CLI_NAME = "fleet-e2e-toy";

/** True when `arg` is a help flag (`--help` or `-h`). */
export function isHelpFlag(arg: string | undefined): boolean {
  return arg === "--help" || arg === "-h";
}

/**
 * Render the global usage text: a synopsis line followed by every registered
 * command and its one-line description. Commands are read from the registry at
 * call time, so the list always matches what can actually be run.
 */
export function renderGlobalHelp(): string {
  const lines: string[] = [];
  lines.push(`Usage: ${CLI_NAME} <command> [options]`);
  lines.push("");

  const commands = listCommands();
  if (commands.length === 0) {
    lines.push("Commands:");
    lines.push("  (no commands registered)");
  } else {
    lines.push("Commands:");
    const width = Math.max(...commands.map((c) => c.name.length));
    for (const command of commands) {
      lines.push(`  ${command.name.padEnd(width)}  ${command.description}`);
    }
  }

  lines.push("");
  lines.push(`Run '${CLI_NAME} <command> --help' for command-specific usage.`);
  lines.push(`Run '${CLI_NAME} --version' to print the version.`);

  return lines.join("\n") + "\n";
}

/** Render usage text for a single subcommand from its `usage`/`description`. */
export function renderCommandHelp(command: Command): string {
  const lines: string[] = [];
  lines.push(`Usage: ${CLI_NAME} ${command.usage}`);
  lines.push("");
  lines.push(command.description);
  return lines.join("\n") + "\n";
}
