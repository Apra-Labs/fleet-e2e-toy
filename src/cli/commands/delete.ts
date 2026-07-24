// 'delete' subcommand: DELETE /api/notes/:id. Requires --id.

import { CommandIO } from "../commands";
import { parseFlags } from "../args";
import { client } from "../client";

export async function deleteHandler(args: string[], io: CommandIO): Promise<number> {
  const flags = parseFlags(args);
  await client.delete(flags.id);
  io.out(`Deleted note ${flags.id}`);
  return 0;
}
