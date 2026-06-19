import { deleteNote } from "../apiClient";
import { CliArgs } from "../types";
import { validateRequired } from "../validate";

export async function deleteCommand(args: CliArgs): Promise<void> {
  const id = args.flags.id;
  const idError = validateRequired("--id", id);
  if (idError) {
    process.stderr.write(`${idError}\n`);
    process.exit(1);
  }

  try {
    await deleteNote(id as string);
    process.stdout.write(`Note ${id as string} deleted\n`);
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
