import { listNotes } from "../client";
import { CliError } from "../client";

function parseArgs(args: string[]): { tag?: string; q?: string } {
  const result: { tag?: string; q?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tag" && i + 1 < args.length) {
      result.tag = args[++i];
    } else if (args[i] === "--q" && i + 1 < args.length) {
      result.q = args[++i];
    }
  }
  return result;
}

export async function listCommand(args: string[]): Promise<number> {
  const query = parseArgs(args);

  let notes;
  try {
    notes = await listNotes(query);
  } catch (err) {
    const message = err instanceof CliError ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    return 1;
  }

  if (notes.length === 0) {
    process.stdout.write("No notes found.\n");
    return 0;
  }

  for (const note of notes) {
    const tags = note.tags.length > 0 ? `[${note.tags.join(", ")}]` : "[]";
    process.stdout.write(`${note.id}  ${note.title}  ${tags}\n`);
  }

  return 0;
}
