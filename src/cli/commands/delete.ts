import { deleteNote, CliError } from "../client";
import { assertNonBlank } from "../validation";

function parseArgs(args: string[]): { id?: string } {
  const result: { id?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && i + 1 < args.length) {
      result.id = args[++i];
    }
  }
  return result;
}

export async function deleteCommand(args: string[]): Promise<number> {
  const { id } = parseArgs(args);

  if (!id) {
    process.stderr.write("Error: --id <id> is required\n");
    return 1;
  }

  try {
    assertNonBlank("id", id);
  } catch (err) {
    const message = err instanceof CliError ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    return 1;
  }

  try {
    await deleteNote(id);
  } catch (err) {
    if (err instanceof CliError && err.status === 404) {
      process.stderr.write("Note not found\n");
      return 1;
    }
    const message = err instanceof CliError ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    return 1;
  }

  process.stdout.write(`Deleted ${id}\n`);
  return 0;
}
