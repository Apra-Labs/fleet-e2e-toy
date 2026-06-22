import { createNote } from "../apiClient";
import { validateRequired, ValidationError } from "../validate";
import { CommandResult, FlagValue } from "../types";

/**
 * Run the `create` subcommand.
 *
 * Requires --title and --content (non-blank). Optional --tags (comma-separated).
 * Prints the created note to stdout and returns exit code 0 on success.
 * Returns non-zero with { error } message on missing/blank input or API error.
 */
export async function runCreate(flags: Record<string, FlagValue>): Promise<CommandResult> {
  try {
    const rawTitle = typeof flags.title === "string" ? flags.title : undefined;
    const rawContent = typeof flags.content === "string" ? flags.content : undefined;

    const title = validateRequired("title", rawTitle);
    const content = validateRequired("content", rawContent);

    const rawTags = typeof flags.tags === "string" ? flags.tags : undefined;
    const tags = rawTags
      ? rawTags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

    const note = await createNote({ title, content, tags });

    const lines = [
      `Created note:`,
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
