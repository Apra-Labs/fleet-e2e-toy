import { getNote } from "../apiClient";
import { CliArgs } from "../types";

export async function readCommand(args: CliArgs): Promise<void> {
  const id = args.flags.id;
  if (!id || id.trim() === "") {
    process.stderr.write("Error: --id is required\n");
    process.exit(1);
  }

  try {
    const note = await getNote(id);
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
