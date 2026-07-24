// Shared, human-readable note formatting for CLI command output.

import { Note } from "../../models/note";

export function formatNote(note: Note): string {
  const tags = note.tags.length > 0 ? note.tags.join(", ") : "(none)";
  return [
    `id: ${note.id}`,
    `title: ${note.title}`,
    `content: ${note.content}`,
    `tags: ${tags}`,
    `createdAt: ${note.createdAt}`,
    `updatedAt: ${note.updatedAt}`,
  ].join("\n");
}
