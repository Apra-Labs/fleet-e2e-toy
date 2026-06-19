import { listNotes } from "../apiClient";
import { CliArgs } from "../types";

export async function listCommand(args: CliArgs): Promise<void> {
  const params: { tag?: string; q?: string } = {};
  if (args.flags.tag) params.tag = args.flags.tag;
  if (args.flags.q) params.q = args.flags.q;

  try {
    const notes = await listNotes(params);
    for (const note of notes) {
      process.stdout.write(`${note.id}\t${note.title}\n`);
    }
    process.exit(0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exit(1);
  }
}
