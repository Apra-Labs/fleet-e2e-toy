import { updateNote, CliError } from "../client";
import { UpdateNoteInput } from "../../models/note";
import { assertNonBlank } from "../validation";

interface ParsedArgs {
  id?: string;
  title?: string;
  content?: string;
  tags?: string[];
}

function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && i + 1 < args.length) {
      result.id = args[++i];
    } else if (args[i] === "--title" && i + 1 < args.length) {
      result.title = args[++i];
    } else if (args[i] === "--content" && i + 1 < args.length) {
      result.content = args[++i];
    } else if (args[i] === "--tag" && i + 1 < args.length) {
      if (!result.tags) result.tags = [];
      result.tags.push(args[++i]);
    }
  }
  return result;
}

export async function updateCommand(args: string[]): Promise<number> {
  const { id, title, content, tags } = parseArgs(args);

  if (!id) {
    process.stderr.write("Error: --id <id> is required\n");
    return 1;
  }

  try {
    assertNonBlank("id", id);
    if (title !== undefined) assertNonBlank("title", title);
    if (content !== undefined) assertNonBlank("content", content);
  } catch (err) {
    const message = err instanceof CliError ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    return 1;
  }

  const input: UpdateNoteInput = {};
  if (title !== undefined) input.title = title;
  if (content !== undefined) input.content = content;
  if (tags !== undefined) input.tags = tags;

  let note;
  try {
    note = await updateNote(id, input);
  } catch (err) {
    if (err instanceof CliError && err.status === 404) {
      process.stderr.write("Note not found\n");
      return 1;
    }
    const message = err instanceof CliError ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    return 1;
  }

  process.stdout.write(`${note.id}  ${note.title}\n`);
  return 0;
}
