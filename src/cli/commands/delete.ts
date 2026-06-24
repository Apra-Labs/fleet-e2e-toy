import { deleteNote } from "../client";

export async function handleDelete(options: Record<string, string | boolean>): Promise<void> {
  const id = typeof options.id === "string" ? options.id : undefined;
  if (!id) {
    console.error("Error: --id is required");
    process.exit(1);
  }

  await deleteNote(id);
}
