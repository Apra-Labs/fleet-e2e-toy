import { CommandHandler } from "../types";
import { apiClient } from "../apiClient";
import { requireNonBlank } from "../validate";

/**
 * `cli read --id <id>`
 * Prints a single note by id. A missing/blank --id is rejected before any
 * HTTP call is made; a 404 from the API is surfaced as a clear error.
 */
export const readCommand: CommandHandler = async (args) => {
  const id = requireNonBlank(args.flags.id, "id");

  const note = await apiClient.getNote(id);

  process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
  return 0;
};
