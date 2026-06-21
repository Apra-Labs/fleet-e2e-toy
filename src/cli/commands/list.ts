import * as apiClient from "../apiClient";
import { CliError, ParsedArgs } from "../types";
import { optionalFlag } from "../validate";
import { Note } from "../../models/note";

function formatNote(note: Note): string {
  const tags = note.tags.length > 0 ? ` [${note.tags.join(", ")}]` : "";
  return `${note.id}: ${note.title}${tags}`;
}

export async function listCommand(parsed: ParsedArgs): Promise<void> {
  const tag = optionalFlag(parsed.flags, "tag");
  const q = optionalFlag(parsed.flags, "q");
  const jsonMode = parsed.flags["json"] === true;

  // Build query string: if both are provided, combine them
  let query: string | undefined;
  if (q) {
    query = q;
  }

  try {
    const notes = await apiClient.listNotes(query);

    // Client-side tag filter if --tag provided
    const filtered = tag
      ? notes.filter((n) => n.tags.includes(tag))
      : notes;

    if (jsonMode) {
      process.stdout.write(JSON.stringify(filtered) + "\n");
      return;
    }

    if (filtered.length === 0) {
      process.stdout.write("No notes found\n");
      return;
    }

    for (const note of filtered) {
      process.stdout.write(formatNote(note) + "\n");
    }
  } catch (err) {
    if (err instanceof CliError) {
      throw err;
    }
    throw new CliError("Failed to list notes");
  }
}
