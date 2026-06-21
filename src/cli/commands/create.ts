import * as apiClient from "../apiClient";
import { CliError, ParsedArgs } from "../types";
import { requireFlag } from "../validate";
import { Note } from "../../models/note";

function formatNote(note: Note): string {
  const tags = note.tags.length > 0 ? note.tags.join(", ") : "(none)";
  return [
    `ID:      ${note.id}`,
    `Title:   ${note.title}`,
    `Content: ${note.content}`,
    `Tags:    ${tags}`,
  ].join("\n");
}

export async function createCommand(parsed: ParsedArgs): Promise<void> {
  const title = requireFlag(parsed.flags, "title");
  const content = requireFlag(parsed.flags, "content");

  // Collect tags: --tag may be repeated; for simplicity accept comma-separated too
  const tagValue = parsed.flags["tag"];
  let tags: string[] = [];
  if (typeof tagValue === "string") {
    tags = tagValue.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  } else if (Array.isArray(tagValue)) {
    tags = (tagValue as string[]).flatMap((t) => t.split(",").map((s) => s.trim()).filter((s) => s.length > 0));
  }

  try {
    const note = await apiClient.createNote({ title, content, tags });
    process.stdout.write(formatNote(note) + "\n");
  } catch (err) {
    if (err instanceof CliError) {
      throw err;
    }
    throw new CliError("Failed to create note");
  }
}
