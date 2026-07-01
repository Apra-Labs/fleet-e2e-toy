import { deleteNote } from "../client";
import { validateRequired } from "../validation";
import type { CommandHandler } from "../index";

export const deleteCommand: CommandHandler = async (flags) => {
  const id = validateRequired("--id", flags["id"]);

  await deleteNote(id);
  process.stdout.write(`Note ${id} deleted.\n`);
};
