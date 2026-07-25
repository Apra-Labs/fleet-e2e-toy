import { CommandHandler } from "../types";
import { apiClient } from "../apiClient";
import { optionalNonBlank } from "../validate";
import { Note } from "../../models/note";

function formatNote(note: Note): string {
  const tags = note.tags.length > 0 ? note.tags.join(", ") : "(none)";
  return `${note.id}  ${note.title}  [tags: ${tags}]`;
}

/**
 * `cli list [--tag <tag>] [--q <query>]`
 * Lists notes, optionally filtered by tag and/or search query.
 */
export const listCommand: CommandHandler = async (args) => {
  const tag = optionalNonBlank(args.flags.tag, "tag");
  const q = optionalNonBlank(args.flags.q, "q");

  const notes = await apiClient.listNotes({ tag, q });

  if (notes.length === 0) {
    process.stdout.write("No notes found.\n");
    return 0;
  }

  for (const note of notes) {
    process.stdout.write(`${formatNote(note)}\n`);
  }
  return 0;
};
