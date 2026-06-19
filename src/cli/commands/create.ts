import { createNote } from "../apiClient";
import { CliArgs } from "../types";
import { CreateNoteInput } from "../../models/note";

export async function createCommand(args: CliArgs): Promise<void> {
  const title = args.flags.title;
  const content = args.flags.content;

  if (!title || title.trim() === "") {
    process.stderr.write("Error: --title is required\n");
    process.exit(1);
  }

  if (!content || content.trim() === "") {
    process.stderr.write("Error: --content is required\n");
    process.exit(1);
  }

  const tags: string[] = args.flags.tag ? [args.flags.tag] : [];

  const input: CreateNoteInput = { title, content, tags };

  try {
    const note = await createNote(input);
    process.stdout.write(`${note.id}\n`);
    process.exit(0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exit(1);
  }
}
