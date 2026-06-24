import { listNotes } from "../client";

export async function handleList(options: Record<string, string | boolean>): Promise<void> {
  const tag = typeof options.tag === "string" ? options.tag : undefined;
  const q = typeof options.q === "string" ? options.q : undefined;

  const notes = await listNotes({ tag, q });
  if (notes.length === 0) {
    console.log("No notes found.");
    return;
  }

  notes.forEach((note, idx) => {
    console.log(`ID: ${note.id}`);
    console.log(`Title: ${note.title}`);
    console.log(`Content: ${note.content}`);
    console.log(`Tags: ${note.tags.join(", ")}`);
    console.log(`Created: ${note.createdAt}`);
    console.log(`Updated: ${note.updatedAt}`);
    if (idx < notes.length - 1) {
      console.log("");
    }
  });
}
