import { createNote } from "../client";

export async function handleCreate(options: Record<string, string | boolean>): Promise<void> {
  const title = typeof options.title === "string" ? options.title : undefined;
  const content = typeof options.content === "string" ? options.content : undefined;
  const tagsStr = typeof options.tags === "string" ? options.tags : undefined;

  if (!title) {
    console.error("Error: --title is required");
    process.exit(1);
  }
  if (!content) {
    console.error("Error: --content is required");
    process.exit(1);
  }

  const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()) : [];

  const note = await createNote({ title, content, tags });
  console.log(`ID: ${note.id}`);
  console.log(`Title: ${note.title}`);
  console.log(`Content: ${note.content}`);
  console.log(`Tags: ${note.tags.join(", ")}`);
  console.log(`Created: ${note.createdAt}`);
  console.log(`Updated: ${note.updatedAt}`);
}
