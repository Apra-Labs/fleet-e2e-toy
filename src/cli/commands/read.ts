import { getNote } from "../client";

export async function handleRead(options: Record<string, string | boolean>): Promise<void> {
  const id = typeof options.id === "string" ? options.id : undefined;
  if (!id) {
    console.error("Error: --id is required");
    process.exit(1);
  }

  const note = await getNote(id);
  console.log(`ID: ${note.id}`);
  console.log(`Title: ${note.title}`);
  console.log(`Content: ${note.content}`);
  console.log(`Tags: ${note.tags.join(", ")}`);
  console.log(`Created: ${note.createdAt}`);
  console.log(`Updated: ${note.updatedAt}`);
}
