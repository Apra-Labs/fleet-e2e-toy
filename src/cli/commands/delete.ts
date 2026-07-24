import { apiRequest } from "../client";
import { parseFlags } from "../args";
import { requireNonEmptyFlags } from "../validation";

const USAGE = "Usage: delete --id <id>";

export async function deleteCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  requireNonEmptyFlags(flags, ["id"], USAGE);

  const id = flags.id;

  await apiRequest<void>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  console.log(`Deleted note ${id}`);
}
