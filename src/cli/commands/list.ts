// 'list' subcommand: GET /api/notes with optional --tag/--q filters.

import { CommandIO } from "../commands";
import { parseFlags } from "../args";
import { client } from "../client";
import { formatNote } from "./format";

export async function listHandler(args: string[], io: CommandIO): Promise<number> {
  const flags = parseFlags(args);
  const notes = await client.list({
    tag: flags.tag || undefined,
    q: flags.q || undefined,
  });

  if (notes.length === 0) {
    io.out("No notes found.");
    return 0;
  }

  for (const note of notes) {
    io.out(formatNote(note));
  }
  return 0;
}
