import { apiRequest } from "../client";
import { parseFlags } from "../args";
import { Note } from "../../models/note";

export async function createCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const { title, content } = flags;

  if (!title || !content) {
    throw new Error("Usage: create --title <title> --content <content>");
  }

  const note = await apiRequest<Note>("/api/notes", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
  console.log(JSON.stringify(note, null, 2));
}
