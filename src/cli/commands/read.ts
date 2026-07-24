import { apiRequest } from "../client";
import { Note } from "../../models/note";

export async function readCommand(args: string[]): Promise<void> {
  const [id] = args;
  if (!id) {
    throw new Error("Usage: read <id>");
  }
  const note = await apiRequest<Note>(`/api/notes/${encodeURIComponent(id)}`);
  console.log(JSON.stringify(note, null, 2));
}
