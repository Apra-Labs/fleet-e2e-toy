import { deleteNote } from "../apiClient";
import { validateRequired, ValidationError } from "../validate";
import { CommandResult, FlagValue } from "../types";

/**
 * Run the `delete` subcommand.
 *
 * Requires --id. Deletes the note and prints a confirmation message.
 * Returns exit code 0 on success, non-zero with { error } on failure.
 */
export async function runDelete(flags: Record<string, FlagValue>): Promise<CommandResult> {
  try {
    const rawId = typeof flags.id === "string" ? flags.id : undefined;
    const id = validateRequired("id", rawId);

    await deleteNote(id);

    return { code: 0, stdout: `Deleted note with ID: ${id}` };
  } catch (err) {
    if (err instanceof ValidationError) {
      return { code: 1, stderr: JSON.stringify({ error: err.message }) };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { code: 1, stderr: JSON.stringify({ error: message }) };
  }
}
