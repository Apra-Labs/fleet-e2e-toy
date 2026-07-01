import { updateNote, CliError, ExitCode } from "../client";
import { UpdateNoteInput } from "../../models/note";
import type { CommandHandler } from "../index";

export const updateCommand: CommandHandler = async (flags) => {
  const id = flags["id"];
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new CliError("--id is required", ExitCode.USAGE);
  }

  const updates: UpdateNoteInput = {};

  if (flags["title"] !== undefined) {
    const title = flags["title"];
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new CliError("--title must be a non-empty string", ExitCode.VALIDATION);
    }
    updates.title = title.trim();
  }

  if (flags["content"] !== undefined) {
    const content = flags["content"];
    if (typeof content !== "string") {
      throw new CliError("--content must be a string", ExitCode.VALIDATION);
    }
    updates.content = content;
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
