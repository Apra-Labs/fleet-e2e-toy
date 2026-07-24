// Subcommand handler contract. Each handler receives the argv slice AFTER the
// subcommand name and returns a process exit code (0 = success). Handlers write
// their own results to stdout via the provided writer and errors via stderr.
//
// These are intentionally stubs: sibling tasks (gh-toy-mi2.2..mi2.6) fill in the
// list/read/create/update/delete behaviour. Keeping them here lets the entrypoint
// dispatch table stay stable while each command is implemented independently.

export interface CommandIO {
  out: (line: string) => void;
  err: (line: string) => void;
}

export type CommandHandler = (
  args: string[],
  io: CommandIO
) => Promise<number>;

function notImplemented(name: string): CommandHandler {
  return async (_args: string[], io: CommandIO): Promise<number> => {
    io.err(`${name}: not implemented yet`);
    return 1;
  };
}

export const listCommand: CommandHandler = notImplemented("list");
export const readCommand: CommandHandler = notImplemented("read");
export const createCommand: CommandHandler = notImplemented("create");
export const updateCommand: CommandHandler = notImplemented("update");
export const deleteCommand: CommandHandler = notImplemented("delete");

// Registry of known subcommands, consumed by the entrypoint dispatcher.
export const commands: Record<string, CommandHandler> = {
  list: listCommand,
  read: readCommand,
  create: createCommand,
  update: updateCommand,
  delete: deleteCommand,
};
