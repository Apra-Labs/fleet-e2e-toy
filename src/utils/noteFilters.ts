import { Note } from "../models/note";

export function filterByTag(notes: Note[], tag?: string): Note[] {
  if (!tag) return notes;
  return notes.filter((n) => n.tags.includes(tag));
}

export function filterByArchived(notes: Note[], includeArchived: boolean): Note[] {
  if (includeArchived) return notes;
  return notes.filter((n) => !n.archived);
}

export function filterBySearch(notes: Note[], q?: string): Note[] {
  if (!q || !q.trim()) return notes;
  const lower = q.toLowerCase();
  return notes.filter(
    (n) => n.title.toLowerCase().includes(lower) || n.content.toLowerCase().includes(lower)
  );
}
