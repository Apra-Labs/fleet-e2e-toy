import * as apiClient from "../apiClient";
import { CliError, ParsedArgs } from "../types";
import { requireFlag } from "../validate";
import { Note } from "../../models/note";

function formatNote(note: Note): string {
  const tags = note.tags.length > 0 ? note.tags.join(", ") : "(none)";
  return [
    `ID:      ${note.id}`,
    `Title:   ${note.title}`,
    `Content: ${note.content}`,
    `Tags:    ${tags}`,
    `Created: ${note.createdAt}`,
    `Updated: ${note.updatedAt}`,
  ].join("\n");
}

export async function readCommand(parsed: ParsedArgs): Promise<void> {
  const id = requireFlag(parsed.flags, "id");

  try {
    const note = await apiClient.getNote(id);
    process.stdout.write(formatNote(note) + "\n");
  } catch (err) {
    if (err instanceof CliError) {
      throw err;
    }
    throw new CliError("Failed to read note");
  }
}
