import { apiRequest } from "../client";
import { parseFlags } from "../args";
import { Note } from "../../models/note";

export async function listCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);

  const query = new URLSearchParams();
  if (flags.tag) query.set("tag", flags.tag);
  if (flags.q) query.set("q", flags.q);

  const queryString = query.toString();
  const path = queryString ? `/api/notes?${queryString}` : "/api/notes";

  const notes = await apiRequest<Note[]>(path);
  console.log(JSON.stringify(notes, null, 2));
}
