import { updateNote } from "../apiClient";
import { validateRequired, ValidationError } from "../validate";
import { CommandResult, FlagValue } from "../types";
import { UpdateNoteInput } from "../../models/note";

/**
 * Run the `update` subcommand.
 *
 * Requires --id. --title/--content are optional but if present must be non-blank.
 * Prints the updated note to stdout and returns exit code 0 on success.
 * Returns non-zero with { error } message on missing required flag or API error.
 */
export async function runUpdate(flags: Record<string, FlagValue>): Promise<CommandResult> {
  try {
    const rawId = typeof flags.id === "string" ? flags.id : undefined;
    const id = validateRequired("id", rawId);

    const updates: UpdateNoteInput = {};

    if (flags.title !== undefined) {
      const rawTitle = typeof flags.title === "string" ? flags.title : undefined;
      updates.title = validateRequired("title", rawTitle);
    }

    if (flags.content !== undefined) {
      const rawContent = typeof flags.content === "string" ? flags.content : undefined;
      updates.content = validateRequired("content", rawContent);
    }

    if (flags.tags !== undefined) {
      const rawTags = typeof flags.tags === "string" ? flags.tags : "";
      updates.tags = rawTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    const note = await updateNote(id, updates);

    const lines = [
      `Updated note:`,
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
