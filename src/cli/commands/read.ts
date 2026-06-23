import { ParsedArgs } from "../args";
import { fetchNote } from "../apiClient";
import { Note } from "../../models/note";

/**
 * 'read' subcommand: calls GET /api/notes/:id and prints the note to stdout.
 * --id is required; exits non-zero if missing.
 */
export function readCommand(args: ParsedArgs): number {
  const id = args.flags["id"];

  if (id === undefined || id === true) {
    process.stderr.write("Error: --id <id> is required for the 'read' command\n");
    return 1;
  }

  if (typeof id === "string" && id.trim().length === 0) {
    process.stderr.write("Error: --id must not be empty or whitespace-only\n");
    return 1;
  }

  const useJson = args.flags["json"] === true;

  fetchNote(id as string)
    .then((note: Note) => {
      if (useJson) {
        process.stdout.write(JSON.stringify(note, null, 2) + "\n");
      } else {
        process.stdout.write(
          `ID:      ${note.id}\n` +
            `Title:   ${note.title}\n` +
            `Content: ${note.content}\n` +
            `Tags:    ${note.tags.join(", ") || "(none)"}\n` +
            `Created: ${note.createdAt}\n` +
            `Updated: ${note.updatedAt}\n`
        );
      }
    })
    .catch((err: Error) => {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exitCode = 1;
    });

  return 0;
}
