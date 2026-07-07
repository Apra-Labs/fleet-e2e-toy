/**
 * Handler for the `create` CLI command.
 *
 * Creates a new note via the API client and prints its id to stdout.
 */

import { CliFlags } from "../index";
import { createNote } from "../apiClient";

function parseTags(raw: string | boolean | undefined): string[] {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return [];
  }
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export async function createCommand(flags: CliFlags): Promise<void> {
  const title = typeof flags.title === "string" ? flags.title : undefined;
  const content = typeof flags.content === "string" ? flags.content : undefined;

  if (!title) {
    process.stderr.write("Error: --title is required\n");
    process.exitCode = 1;
    return;
  }

  if (!content) {
    process.stderr.write("Error: --content is required\n");
    process.exitCode = 1;
    return;
  }

  const tags = parseTags(flags.tags);

  const note = await createNote({ title, content, tags });
  process.stdout.write(`${note.id}\n`);
}
