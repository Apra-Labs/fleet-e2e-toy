import { ParsedArgs } from "../args";
import { fetchNotes } from "../apiClient";
import { Note } from "../../models/note";

/**
 * 'list' subcommand: calls GET /api/notes with optional --tag and --q filters
 * and prints the results to stdout.
 */
export function listCommand(args: ParsedArgs): number {
  const tag =
    typeof args.flags["tag"] === "string" ? args.flags["tag"] : undefined;
  const q =
    typeof args.flags["q"] === "string" ? args.flags["q"] : undefined;
  const useJson = args.flags["json"] === true;

  fetchNotes(tag, q)
    .then((notes: Note[]) => {
      if (useJson) {
        process.stdout.write(JSON.stringify(notes, null, 2) + "\n");
      } else {
        if (notes.length === 0) {
          process.stdout.write("No notes found.\n");
        } else {
          notes.forEach((note) => {
            process.stdout.write(
              `[${note.id}] ${note.title}` +
                (note.tags.length > 0 ? ` (${note.tags.join(", ")})` : "") +
                "\n"
            );
          });
        }
      }
    })
    .catch((err: Error) => {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exitCode = 1;
    });

  return 0;
}
