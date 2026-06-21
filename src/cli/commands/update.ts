import * as apiClient from "../apiClient";
import { CliError, ParsedArgs } from "../types";
import { requireFlag, optionalFlag } from "../validate";
import { Note, UpdateNoteInput } from "../../models/note";

function formatNote(note: Note): string {
  const tags = note.tags.length > 0 ? note.tags.join(", ") : "(none)";
  return [
    `ID:      ${note.id}`,
    `Title:   ${note.title}`,
    `Content: ${note.content}`,
    `Tags:    ${tags}`,
    `Updated: ${note.updatedAt}`,
  ].join("\n");
}

export async function updateCommand(parsed: ParsedArgs): Promise<void> {
  const id = requireFlag(parsed.flags, "id");
  const title = optionalFlag(parsed.flags, "title");
  const content = optionalFlag(parsed.flags, "content");

  if (!title && !content) {
    throw new CliError("At least one of --title or --content is required");
  }

  const input: UpdateNoteInput = {};
  if (title) input.title = title;
  if (content) input.content = content;

  try {
    const note = await apiClient.updateNote(id, input);
    process.stdout.write(formatNote(note) + "\n");
  } catch (err) {
    if (err instanceof CliError) {
      throw err;
    }
    throw new CliError("Failed to update note");
  }
}
