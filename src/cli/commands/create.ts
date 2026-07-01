import { createNote } from "../client";
import { validateRequired } from "../validation";
import type { CommandHandler } from "../index";

export const createCommand: CommandHandler = async (flags) => {
  const title = validateRequired("--title", flags["title"]);
  const content = validateRequired("--content", flags["content"]);

  // --tag may be given once or as comma-separated values
  const tagRaw = flags["tag"];
  let tags: string[] = [];
  if (typeof tagRaw === "string" && tagRaw.trim().length > 0) {
    tags = tagRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  }

  const note = await createNote({ title, content, tags });
  process.stdout.write(`${note.id}\n`);
};
