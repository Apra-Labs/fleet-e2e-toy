import { apiRequest } from "../client";
import { parseFlags } from "../args";
import { requireNonEmptyFlags } from "../validation";
import { Note } from "../../models/note";

const USAGE = "Usage: read --id <id>";

export async function readCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  requireNonEmptyFlags(flags, ["id"], USAGE);

  const id = flags.id;
  const note = await apiRequest<Note>(`/api/notes/${encodeURIComponent(id)}`);
  console.log(JSON.stringify(note, null, 2));
}
