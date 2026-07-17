// Command registry for the NoteAPI CLI.
//
// This is the extension point every later CLI task plugs into: a subcommand
// implements the `Command` interface and is added to the `commands` map via
// `registerCommand`. The dispatcher (see index.ts) looks a command up by name
// and invokes its `run` handler.

/** Context passed to every command handler. */
export interface CommandContext {
  /** Arguments that follow the subcommand name (i.e. argv minus the command). */
  args: string[];
}

/** A single CLI subcommand. */
export interface Command {
  /** The name typed on the command line, e.g. "list" or "create". */
  name: string;
  /** One-line description used by the help system (gh-toy-2fq.3). */
  description: string;
  /** Usage string used by the help system, e.g. "create <title> [content]". */
  usage: string;
  /**
   * Execute the command. May return a non-zero number to signal a specific
   * exit code, or nothing to indicate success (exit 0).
   */
  run(ctx: CommandContext): Promise<number | void> | number | void;
}

/** Registered commands, keyed by name. Later tasks populate this. */
const commands = new Map<string, Command>();

/** Register a command so the dispatcher can find it by name. */
export function registerCommand(command: Command): void {
  commands.set(command.name, command);
}

/** Look up a command by name, or `undefined` if none is registered. */
export function getCommand(name: string): Command | undefined {
  return commands.get(name);
}

/** All registered commands, in registration order (used by the help system). */
export function listCommands(): Command[] {
  return Array.from(commands.values());
}
