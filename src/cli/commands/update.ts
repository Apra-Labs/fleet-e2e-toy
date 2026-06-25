import { updateNote, ApiError } from "../apiClient";
import { Note } from "../../models/note";

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

function formatNote(note: Note): string {
  return [
    `ID:      ${note.id}`,
    `Title:   ${note.title}`,
    `Content: ${note.content}`,
    `Tags:    ${note.tags.length > 0 ? note.tags.join(", ") : "(none)"}`,
    `Created: ${note.createdAt}`,
    `Updated: ${note.updatedAt}`,
  ].join("\n");
}

/**
 * Execute the `update` subcommand.
 * Flags: --id <id> (REQUIRED), --title <t>, --content <c>
 */
export async function runUpdate(argv: string[]): Promise<CliResult> {
  let id: string | undefined;
  let title: string | undefined;
  let content: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--id" && argv[i + 1] !== undefined) {
      id = argv[i + 1];
      i++;
    } else if (argv[i] === "--title" && argv[i + 1] !== undefined) {
      title = argv[i + 1];
      i++;
    } else if (argv[i] === "--content" && argv[i + 1] !== undefined) {
      content = argv[i + 1];
      i++;
    }
  }

  if (!id) {
    return {
      stdout: "",
      stderr: "Usage: cli update --id <id> [--title <title>] [--content <content>]\nError: --id is required",
      exitCode: 1,
    };
  }

  const updates: { title?: string; content?: string } = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;

  try {
    const note = await updateNote(id, updates);
    return { stdout: formatNote(note), stderr: "", exitCode: 0 };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) {
        return {
          stdout: "",
          stderr: `Error: Note with id "${id}" not found`,
          exitCode: 1,
        };
      }
      return { stdout: "", stderr: `Error: ${err.message}`, exitCode: 1 };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { stdout: "", stderr: `Error: ${message}`, exitCode: 1 };
  }
}
