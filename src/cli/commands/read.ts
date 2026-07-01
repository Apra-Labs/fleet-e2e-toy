import { getNote } from "../client";
import { validateRequired } from "../validation";
import type { CommandHandler } from "../index";

export const readCommand: CommandHandler = async (flags) => {
  const id = validateRequired("--id", flags["id"]);

  const note = await getNote(id);
  process.stdout.write(
    `id: ${note.id}\ntitle: ${note.title}\ncontent: ${note.content}\ntags: ${note.tags.join(", ")}\n`
  );
};
