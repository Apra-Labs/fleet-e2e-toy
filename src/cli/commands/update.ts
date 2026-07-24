import { apiRequest } from "../client";
import { Note } from "../../models/note";

export async function updateCommand(args: string[]): Promise<void> {
  const [id, title, content] = args;
  if (!id || (!title && !content)) {
    throw new Error("Usage: update <id> [title] [content]");
  }
  const updates: Record<string, string> = {};
  if (title) updates.title = title;
  if (content) updates.content = content;

  const note = await apiRequest<Note>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  console.log(JSON.stringify(note, null, 2));
}
