import { deleteNote, CliError, ExitCode } from "../client";
import type { CommandHandler } from "../index";

export const deleteCommand: CommandHandler = async (flags) => {
  const id = flags["id"];
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new CliError("--id is required", ExitCode.USAGE);
  }

  await deleteNote(id);
  process.stdout.write(`Note ${id} deleted.\n`);
};
