import { listNotes } from "../apiClient";
import { CommandResult } from "../types";
import { FlagValue } from "../types";

/**
 * Run the `list` subcommand.
 *
 * Supports optional --tag and --q filters. Prints all matching notes to
 * stdout as JSON, one per line. Returns exit code 0 on success, 1 on error.
 */
export async function runList(flags: Record<string, FlagValue>): Promise<CommandResult> {
  try {
    const tag = typeof flags.tag === "string" ? flags.tag : undefined;
    const q = typeof flags.q === "string" ? flags.q : undefined;

    const notes = await listNotes({ tag, q });

    if (notes.length === 0) {
      return { code: 0, stdout: "No notes found." };
    }

    const lines = notes
      .map(
        (n) =>
          `[${n.id}] ${n.title}` +
          (n.tags.length > 0 ? ` (tags: ${n.tags.join(", ")})` : "")
      )
      .join("\n");

    return { code: 0, stdout: lines };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { code: 1, stderr: JSON.stringify({ error: message }) };
  }
}
