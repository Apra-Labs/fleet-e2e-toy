import { apiRequest } from "../client";
import { Note } from "../../models/note";

export async function listCommand(_args: string[]): Promise<void> {
  const notes = await apiRequest<Note[]>("/api/notes");
  console.log(JSON.stringify(notes, null, 2));
}
