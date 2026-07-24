import { apiRequest } from "../client";

export async function deleteCommand(args: string[]): Promise<void> {
  const [id] = args;
  if (!id) {
    throw new Error("Usage: delete <id>");
  }
  await apiRequest<void>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  console.log(`Deleted note ${id}`);
}
