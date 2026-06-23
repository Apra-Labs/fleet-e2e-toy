import { getNote, CliError } from "../client";

function parseArgs(args: string[]): { id?: string } {
  const result: { id?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && i + 1 < args.length) {
      result.id = args[++i];
    }
  }
  return result;
}

export async function readCommand(args: string[]): Promise<number> {
  const { id } = parseArgs(args);

  if (!id) {
    process.stderr.write("Error: --id <id> is required\n");
    return 1;
  }

  let note;
  try {
    note = await getNote(id);
  } catch (err) {
    if (err instanceof CliError && err.status === 404) {
      process.stderr.write("Note not found\n");
      return 1;
    }
    const message = err instanceof CliError ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    return 1;
  }

  const tags = note.tags.length > 0 ? note.tags.join(", ") : "(none)";
  process.stdout.write(`id:      ${note.id}\n`);
  process.stdout.write(`title:   ${note.title}\n`);
  process.stdout.write(`content: ${note.content}\n`);
  process.stdout.write(`tags:    ${tags}\n`);

  return 0;
}
