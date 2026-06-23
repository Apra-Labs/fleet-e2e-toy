import { createNote, CliError } from "../client";
import { CreateNoteInput } from "../../models/note";

interface ParsedArgs {
  title?: string;
  content?: string;
  tags: string[];
}

function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = { tags: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--title" && i + 1 < args.length) {
      result.title = args[++i];
    } else if (args[i] === "--content" && i + 1 < args.length) {
      result.content = args[++i];
    } else if (args[i] === "--tag" && i + 1 < args.length) {
      result.tags.push(args[++i]);
    }
  }
  return result;
}

export async function createCommand(args: string[]): Promise<number> {
  const { title, content, tags } = parseArgs(args);

  if (!title) {
    process.stderr.write("Error: --title <title> is required\n");
    return 1;
  }

  if (!content) {
    process.stderr.write("Error: --content <content> is required\n");
    return 1;
  }

  const input: CreateNoteInput = { title, content, tags };

  let note;
  try {
    note = await createNote(input);
  } catch (err) {
    const message = err instanceof CliError ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    return 1;
  }

  process.stdout.write(`${note.id}  ${note.title}\n`);
  return 0;
}
