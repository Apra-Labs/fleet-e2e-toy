import { createNote } from "../apiClient";
import { CliArgs } from "../types";
import { CreateNoteInput } from "../../models/note";
import { validateRequired } from "../validate";

export async function createCommand(args: CliArgs): Promise<void> {
  const title = args.flags.title;
  const content = args.flags.content;

  const titleError = validateRequired("--title", title);
  if (titleError) {
    process.stderr.write(`${titleError}\n`);
    process.exit(1);
  }

  const contentError = validateRequired("--content", content);
  if (contentError) {
    process.stderr.write(`${contentError}\n`);
    process.exit(1);
  }

  const tags: string[] = args.flags.tag ? [args.flags.tag] : [];

  const input: CreateNoteInput = { title: title as string, content: content as string, tags };

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
