// 'read' subcommand: GET /api/notes/:id. Requires --id.

import { CommandIO } from "../commands";
import { parseFlags } from "../args";
import { client } from "../client";
import { formatNote } from "./format";

export async function readHandler(args: string[], io: CommandIO): Promise<number> {
  const flags = parseFlags(args);
  const note = await client.read(flags.id);
  io.out(formatNote(note));
  return 0;
}
