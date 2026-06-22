import { getNote } from "../apiClient";
import { validateRequired, ValidationError } from "../validate";
import { CommandResult } from "../types";
import { FlagValue } from "../types";

/**
 * Run the `read` subcommand.
 *
 * Requires --id. Fetches and prints the note to stdout.
 * Returns exit code 0 on success, 1 on error (missing --id or API error).
 */
export async function runRead(flags: Record<string, FlagValue>): Promise<CommandResult> {
  try {
    const rawId = typeof flags.id === "string" ? flags.id : undefined;
    const id = validateRequired("id", rawId);

    const note = await getNote(id);

    const lines = [
      `ID:      ${note.id}`,
      `Title:   ${note.title}`,
      `Content: ${note.content}`,
      `Tags:    ${note.tags.length > 0 ? note.tags.join(", ") : "(none)"}`,
      `Created: ${note.createdAt}`,
      `Updated: ${note.updatedAt}`,
    ].join("\n");

    return { code: 0, stdout: lines };
  } catch (err) {
    if (err instanceof ValidationError) {
      return { code: 1, stderr: JSON.stringify({ error: err.message }) };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { code: 1, stderr: JSON.stringify({ error: message }) };
  }
}
