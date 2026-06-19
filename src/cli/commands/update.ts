import { updateNote } from "../apiClient";
import { CliArgs } from "../types";
import { UpdateNoteInput } from "../../models/note";
import { validateRequired } from "../validate";

export async function updateCommand(args: CliArgs): Promise<void> {
  const id = args.flags.id;
  const idError = validateRequired("--id", id);
  if (idError) {
    process.stderr.write(`${idError}\n`);
    process.exit(1);
  }

  const update: UpdateNoteInput = {};
  if (args.flags.title) update.title = args.flags.title;
  if (args.flags.content) update.content = args.flags.content;
  if (args.flags.tag) update.tags = [args.flags.tag];

  if (Object.keys(update).length === 0) {
    process.stderr.write("Error: at least one of --title, --content, or --tag is required\n");
    process.exit(1);
  }

  try {
    const note = await updateNote(id as string, update);
    process.stdout.write(`id: ${note.id}\n`);
    process.stdout.write(`title: ${note.title}\n`);
    process.stdout.write(`content: ${note.content}\n`);
    process.stdout.write(`tags: ${note.tags.join(", ")}\n`);
    process.exit(0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("404")) {
      process.stderr.write("Note not found\n");
    } else {
      process.stderr.write(`Error: ${message}\n`);
    }
    process.exit(1);
  }
}
