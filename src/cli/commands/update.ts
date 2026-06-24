import { updateNote } from "../client";
import { UpdateNoteInput } from "../../models/note";

export async function handleUpdate(options: Record<string, string | boolean>): Promise<void> {
  const id = typeof options.id === "string" ? options.id : undefined;
  if (!id) {
    console.error("Error: --id is required");
    process.exit(1);
  }

  const input: UpdateNoteInput = {};
  if (typeof options.title === "string") {
    input.title = options.title;
  }
  if (typeof options.content === "string") {
    input.content = options.content;
  }
  if (typeof options.tags === "string") {
    input.tags = options.tags.split(",").map((t) => t.trim());
  }

  const note = await updateNote(id, input);
  console.log(`ID: ${note.id}`);
  console.log(`Title: ${note.title}`);
  console.log(`Content: ${note.content}`);
  console.log(`Tags: ${note.tags.join(", ")}`);
  console.log(`Created: ${note.createdAt}`);
  console.log(`Updated: ${note.updatedAt}`);
}
