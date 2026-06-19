import { deleteNote } from "../apiClient";
import { CliArgs } from "../types";

export async function deleteCommand(args: CliArgs): Promise<void> {
  const id = args.flags.id;
  if (!id || id.trim() === "") {
    process.stderr.write("Error: --id is required\n");
    process.exit(1);
  }

  try {
    await deleteNote(id);
    process.stdout.write(`Note ${id} deleted\n`);
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
