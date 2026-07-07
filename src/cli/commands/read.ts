/**
 * Handler for the `read` CLI command.
 *
 * Reads a single note by id and prints it as formatted JSON to stdout.
 */

import { CliFlags } from "../index";
import { getNote } from "../apiClient";

export async function readCommand(flags: CliFlags): Promise<void> {
  const id = typeof flags.id === "string" ? flags.id : undefined;

  if (!id) {
    process.stderr.write("Error: --id is required\n");
    process.exitCode = 1;
    return;
  }

  const note = await getNote(id);
  process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
}
