import { ParsedArgs, validateNonBlank } from "../args";
import { deleteNote } from "../apiClient";

/**
 * 'delete' subcommand: DELETEs /api/notes/:id.
 * --id is required.
 */
export function deleteCommand(args: ParsedArgs): number {
  let id: string;

  try {
    id = validateNonBlank(args.flags["id"], "--id");
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    return 1;
  }

  deleteNote(id)
    .then(() => {
      process.stdout.write(`Deleted note ${id}\n`);
    })
    .catch((err: Error) => {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exitCode = 1;
    });

  return 0;
}
