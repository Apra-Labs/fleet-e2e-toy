// Subcommand handler contract. Each handler receives the argv slice AFTER the
// subcommand name and returns a process exit code (0 = success). Handlers write
// their own results to stdout via the provided writer and errors via stderr.
//
// These are intentionally stubs: sibling tasks (gh-toy-mi2.2..mi2.6) fill in the
// list/read/create/update/delete behaviour. Keeping them here lets the entrypoint
// dispatch table stay stable while each command is implemented independently.

import { commandUsage, wantsHelp } from "./help";
import { parseFlags, validateNonEmpty, ValidationError } from "./args";
import { listHandler } from "./commands/list";
import { readHandler } from "./commands/read";
import { createHandler } from "./commands/create";
import { updateHandler } from "./commands/update";

export interface CommandIO {
  out: (line: string) => void;
  err: (line: string) => void;
}

export type CommandHandler = (
  args: string[],
  io: CommandIO
) => Promise<number>;

// Wraps a handler so that --help/-h is honoured before the handler's own
// argument parsing runs: prints the subcommand's usage to stdout and exits 0.
function withHelp(name: string, handler: CommandHandler): CommandHandler {
  return async (args: string[], io: CommandIO): Promise<number> => {
    if (wantsHelp(args)) {
      io.out(commandUsage(name));
      return 0;
    }
    return handler(args, io);
  };
}

// Wraps a handler so that the given required string flags are validated
// (present, non-empty, non-blank) before the handler runs. On failure, writes
// a readable error naming the offending flag to stderr (no stack trace) and
// returns a non-zero exit code.
function withRequiredFlags(
  requiredFlags: string[],
  handler: CommandHandler
): CommandHandler {
  return async (args: string[], io: CommandIO): Promise<number> => {
    const flags = parseFlags(args);
    try {
      for (const flag of requiredFlags) {
        validateNonEmpty(flag, flags[flag]);
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        io.err(`error: ${err.message}`);
        return 1;
      }
      throw err;
    }
    return handler(args, io);
  };
}

function notImplemented(name: string): CommandHandler {
  return async (_args: string[], io: CommandIO): Promise<number> => {
    io.err(`${name}: not implemented yet`);
    return 1;
  };
}

export const listCommand: CommandHandler = withHelp("list", listHandler);
export const readCommand: CommandHandler = withHelp(
  "read",
  withRequiredFlags(["id"], readHandler)
);
export const createCommand: CommandHandler = withHelp(
  "create",
  withRequiredFlags(["title", "content"], createHandler)
);
export const updateCommand: CommandHandler = withHelp(
  "update",
  withRequiredFlags(["id"], updateHandler)
);
export const deleteCommand: CommandHandler = withHelp("delete", notImplemented("delete"));

// Registry of known subcommands, consumed by the entrypoint dispatcher.
export const commands: Record<string, CommandHandler> = {
  list: listCommand,
  read: readCommand,
  create: createCommand,
  update: updateCommand,
  delete: deleteCommand,
};
