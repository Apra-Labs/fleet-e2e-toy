/**
 * Handler for the `create` CLI command.
 *
 * Creates a new note via the API client and prints its id to stdout.
 */

import { CliFlags } from "../index";
import { createNote } from "../apiClient";
import { requireNonBlank } from "../validation";

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
  const titleFlag = typeof flags.title === "string" ? flags.title : undefined;
  const contentFlag = typeof flags.content === "string" ? flags.content : undefined;

  if (!titleFlag) {
    process.stderr.write("Error: --title is required\n");
    process.exitCode = 1;
    return;
  }

  if (!contentFlag) {
    process.stderr.write("Error: --content is required\n");
    process.exitCode = 1;
    return;
  }

  const title = requireNonBlank("title", titleFlag);
  const content = requireNonBlank("content", contentFlag);

  const tags = parseTags(flags.tags);

  const note = await createNote({ title, content, tags });
  process.stdout.write(`${note.id}\n`);
}
