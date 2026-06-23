import { ParsedArgs, validateNonBlank } from "../args";
import { createNote } from "../apiClient";
import { Note } from "../../models/note";

/**
 * 'create' subcommand: POSTs /api/notes with --title and --content (required)
 * and optional --tags (comma-separated). Prints the created note to stdout.
 */
export function createCommand(args: ParsedArgs): number {
  let title: string;
  let content: string;

  try {
    title = validateNonBlank(args.flags["title"], "--title");
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    return 1;
  }

  try {
    content = validateNonBlank(args.flags["content"], "--content");
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    return 1;
  }

  const tagsRaw = args.flags["tags"];
  const tags: string[] =
    typeof tagsRaw === "string" && tagsRaw.trim().length > 0
      ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

  const useJson = args.flags["json"] === true;

  createNote(title, content, tags)
    .then((note: Note) => {
      if (useJson) {
        process.stdout.write(JSON.stringify(note, null, 2) + "\n");
      } else {
        process.stdout.write(
          `Created note:\n` +
            `  ID:      ${note.id}\n` +
            `  Title:   ${note.title}\n` +
            `  Content: ${note.content}\n` +
            `  Tags:    ${note.tags.join(", ") || "(none)"}\n`
        );
      }
    })
    .catch((err: Error) => {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exitCode = 1;
    });

  return 0;
}
