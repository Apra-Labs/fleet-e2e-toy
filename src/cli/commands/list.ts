/**
 * Handler for the `list` CLI command.
 *
 * Lists notes, optionally filtered by tag and/or search query. Prints one
 * line per note (id + title) to stdout.
 */

import { CliFlags } from "../index";
import { listNotes } from "../apiClient";

export async function listCommand(flags: CliFlags): Promise<void> {
  const tag = typeof flags.tag === "string" ? flags.tag : undefined;
  const q = typeof flags.q === "string" ? flags.q : undefined;

  const notes = await listNotes({ tag, q });

  for (const note of notes) {
    process.stdout.write(`${note.id}  ${note.title}\n`);
  }
}
