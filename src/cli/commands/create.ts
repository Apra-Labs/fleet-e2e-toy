import { apiRequest } from "../client";
import { parseFlags } from "../args";
import { requireNonEmptyFlags } from "../validation";
import { Note } from "../../models/note";

const USAGE = "Usage: create --title <title> --content <content>";

export async function createCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  requireNonEmptyFlags(flags, ["title", "content"], USAGE);

  const { title, content } = flags;

  const note = await apiRequest<Note>("/api/notes", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
  console.log(JSON.stringify(note, null, 2));
}
