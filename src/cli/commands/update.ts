import { apiRequest } from "../client";
import { parseFlags } from "../args";
import { isNonEmpty } from "../validation";
import { Note } from "../../models/note";

const USAGE = "Usage: update --id <id> [--title <title>] [--content <content>]";

export async function updateCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const { id, title, content } = flags;

  if (!isNonEmpty(id)) {
    throw new Error(USAGE);
  }

  const titleProvided = title !== undefined;
  const contentProvided = content !== undefined;

  if (!titleProvided && !contentProvided) {
    throw new Error(USAGE);
  }

  if ((titleProvided && !isNonEmpty(title)) || (contentProvided && !isNonEmpty(content))) {
    throw new Error(USAGE);
  }

  const updates: Record<string, string> = {};
  if (titleProvided) updates.title = title as string;
  if (contentProvided) updates.content = content as string;

  const note = await apiRequest<Note>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  console.log(JSON.stringify(note, null, 2));
}
