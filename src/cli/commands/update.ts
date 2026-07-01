import { updateNote } from "../client";
import { validateRequired } from "../validation";
import { UpdateNoteInput } from "../../models/note";
import type { CommandHandler } from "../index";

export const updateCommand: CommandHandler = async (flags) => {
  const id = validateRequired("--id", flags["id"]);

  const updates: UpdateNoteInput = {};

  if (flags["title"] !== undefined) {
    updates.title = validateRequired("--title", flags["title"]);
  }

  if (flags["content"] !== undefined) {
    updates.content = validateRequired("--content", flags["content"]);
  }

  if (flags["tag"] !== undefined) {
    const tagRaw = flags["tag"];
    if (typeof tagRaw === "string" && tagRaw.trim().length > 0) {
      updates.tags = tagRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    } else {
      updates.tags = [];
    }
  }

  const note = await updateNote(id, updates);
  process.stdout.write(
    `id: ${note.id}\ntitle: ${note.title}\ncontent: ${note.content}\ntags: ${note.tags.join(", ")}\n`
  );
};
