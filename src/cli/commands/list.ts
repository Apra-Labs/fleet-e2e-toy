import { listNotes } from "../client";
import type { CommandHandler } from "../index";

export const listCommand: CommandHandler = async (flags) => {
  const tag = typeof flags["tag"] === "string" ? flags["tag"] : undefined;
  const q = typeof flags["q"] === "string" ? flags["q"] : undefined;

  const notes = await listNotes({ tag, q });
  for (const note of notes) {
    process.stdout.write(`${note.id} ${note.title}\n`);
  }
};
