import { apiRequest } from "../client";
import { parseFlags } from "../args";

export async function deleteCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const id = flags.id;

  if (!id) {
    throw new Error("Usage: delete --id <id>");
  }

  await apiRequest<void>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  console.log(`Deleted note ${id}`);
}
