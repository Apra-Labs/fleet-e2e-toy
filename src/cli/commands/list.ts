import { listNotes, ApiError } from "../apiClient";
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
 * Execute the `list` subcommand.
 * Flags: --tag <tag>, --q <query>
 */
export async function runList(argv: string[]): Promise<CliResult> {
  let tag: string | undefined;
  let q: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--tag" && argv[i + 1] !== undefined) {
      tag = argv[i + 1];
      i++;
    } else if (argv[i] === "--q" && argv[i + 1] !== undefined) {
      q = argv[i + 1];
      i++;
    }
  }

  try {
    const notes = await listNotes({ tag, q });
    if (notes.length === 0) {
      return { stdout: "(no notes found)", stderr: "", exitCode: 0 };
    }
    const output = notes.map(formatNote).join("\n---\n");
    return { stdout: output, stderr: "", exitCode: 0 };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        stdout: "",
        stderr: `Error: ${err.message}`,
        exitCode: 1,
      };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { stdout: "", stderr: `Error: ${message}`, exitCode: 1 };
  }
}
