import { createNote, ApiError } from "../apiClient";
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
 * Execute the `create` subcommand.
 * Flags: --title <t> (REQUIRED), --content <c> (REQUIRED), --tag <tag> (repeatable)
 */
export async function runCreate(argv: string[]): Promise<CliResult> {
  let title: string | undefined;
  let content: string | undefined;
  const tags: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--title" && argv[i + 1] !== undefined) {
      title = argv[i + 1];
      i++;
    } else if (argv[i] === "--content" && argv[i + 1] !== undefined) {
      content = argv[i + 1];
      i++;
    } else if (argv[i] === "--tag" && argv[i + 1] !== undefined) {
      tags.push(argv[i + 1]);
      i++;
    }
  }

  const missing: string[] = [];
  if (!title) missing.push("--title");
  if (!content) missing.push("--content");

  if (missing.length > 0) {
    return {
      stdout: "",
      stderr: `Usage: cli create --title <title> --content <content> [--tag <tag>]\nError: missing required flag(s): ${missing.join(", ")}`,
      exitCode: 1,
    };
  }

  try {
    const note = await createNote({ title: title as string, content: content as string, tags });
    return { stdout: formatNote(note), stderr: "", exitCode: 0 };
  } catch (err) {
    if (err instanceof ApiError) {
      return { stdout: "", stderr: `Error: ${err.message}`, exitCode: 1 };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { stdout: "", stderr: `Error: ${message}`, exitCode: 1 };
  }
}
