import { CommandHandler } from "../types";
import { apiClient } from "../apiClient";
import { requireNonBlank } from "../validate";

/**
 * `cli delete --id <id>`
 * Deletes a note and prints a confirmation. 404 from the API surfaces as a
 * clear error with a non-zero exit code.
 */
export const deleteCommand: CommandHandler = async (args) => {
  const id = requireNonBlank(args.flags.id, "id");

  await apiClient.deleteNote(id);

  process.stdout.write(`Deleted note ${id}.\n`);
  return 0;
};
