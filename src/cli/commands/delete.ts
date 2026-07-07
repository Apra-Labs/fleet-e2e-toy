/**
 * Handler for the `delete` CLI command.
 *
 * Deletes a note by id via the API client and prints a confirmation.
 */

import { CliFlags } from "../index";
import { deleteNote } from "../apiClient";
import { requireNonBlank } from "../validation";

export async function deleteCommand(flags: CliFlags): Promise<void> {
  const idFlag = typeof flags.id === "string" ? flags.id : undefined;

  if (!idFlag) {
    process.stderr.write("Error: --id is required\n");
    process.exitCode = 1;
    return;
  }

  const id = requireNonBlank("id", idFlag);

  await deleteNote(id);
  process.stdout.write(`Deleted note ${id}\n`);
}
