/**
 * Handler for the `update` CLI command.
 *
 * Updates an existing note via the API client and prints the updated note
 * as formatted JSON to stdout.
 */

import { CliFlags } from "../index";
import { updateNote } from "../apiClient";
import { UpdateNoteInput } from "../../models/note";

function parseTags(raw: string | boolean | undefined): string[] {
  if (typeof raw !== "string") {
    return [];
  }
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export async function updateCommand(flags: CliFlags): Promise<void> {
  const id = typeof flags.id === "string" ? flags.id : undefined;

  if (!id) {
    process.stderr.write("Error: --id is required\n");
    process.exitCode = 1;
    return;
  }

  const input: UpdateNoteInput = {};
  if (typeof flags.title === "string") {
    input.title = flags.title;
  }
  if (typeof flags.content === "string") {
    input.content = flags.content;
  }
  if (typeof flags.tags === "string") {
    input.tags = parseTags(flags.tags);
  }

  const note = await updateNote(id, input);
  process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
}
