import { ParsedArgs, validateNonBlank } from "../args";
import { updateNote } from "../apiClient";
import { Note } from "../../models/note";

/**
 * 'update' subcommand: PUTs /api/notes/:id with optional --title/--content/--tags.
 * --id is required; at least one of the other flags should be provided.
 */
export function updateCommand(args: ParsedArgs): number {
  let id: string;

  try {
    id = validateNonBlank(args.flags["id"], "--id");
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    return 1;
  }

  const updates: { title?: string; content?: string; tags?: string[] } = {};

  const titleRaw = args.flags["title"];
  if (titleRaw !== undefined) {
    try {
      updates.title = validateNonBlank(titleRaw, "--title");
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      return 1;
    }
  }

  const contentRaw = args.flags["content"];
  if (contentRaw !== undefined) {
    try {
      updates.content = validateNonBlank(contentRaw, "--content");
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      return 1;
    }
  }

  const tagsRaw = args.flags["tags"];
  if (tagsRaw !== undefined && typeof tagsRaw === "string") {
    updates.tags = tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  }

  const useJson = args.flags["json"] === true;

  updateNote(id, updates)
    .then((note: Note) => {
      if (useJson) {
        process.stdout.write(JSON.stringify(note, null, 2) + "\n");
      } else {
        process.stdout.write(
          `Updated note:\n` +
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
