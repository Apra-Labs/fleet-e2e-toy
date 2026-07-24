import { apiRequest } from "../client";
import { Note } from "../../models/note";

export async function createCommand(args: string[]): Promise<void> {
  const [title, content] = args;
  if (!title || !content) {
    throw new Error("Usage: create <title> <content>");
  }
  const note = await apiRequest<Note>("/api/notes", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
  console.log(JSON.stringify(note, null, 2));
}
