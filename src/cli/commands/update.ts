// 'update' subcommand: PUT /api/notes/:id. Requires --id; --title/--content
// are optional and only sent if provided.

import { CommandIO } from "../commands";
import { parseFlags } from "../args";
import { client } from "../client";
import { UpdateNoteInput } from "../../models/note";
import { formatNote } from "./format";

export async function updateHandler(args: string[], io: CommandIO): Promise<number> {
  const flags = parseFlags(args);
  const updates: UpdateNoteInput = {};
  if (flags.title !== undefined) updates.title = flags.title;
  if (flags.content !== undefined) updates.content = flags.content;

  const note = await client.update(flags.id, updates);
  io.out(formatNote(note));
  return 0;
}
