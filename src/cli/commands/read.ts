import { apiRequest } from "../client";
import { parseFlags } from "../args";
import { Note } from "../../models/note";

export async function readCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const id = flags.id;

  if (!id) {
    throw new Error("Usage: read --id <id>");
  }

  const note = await apiRequest<Note>(`/api/notes/${encodeURIComponent(id)}`);
  console.log(JSON.stringify(note, null, 2));
}
