export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateNoteInput = Pick<Note, "title" | "content" | "tags">;
export type UpdateNoteInput = Partial<CreateNoteInput>;

// In-memory store — replaced by a real DB in production
const notes = new Map<string, Note>();

export const noteStore = {
  getAll(): Note[] {
    return Array.from(notes.values());
  },

  getById(id: string): Note | undefined {
    return notes.get(id);
  },

  create(note: Note): Note {
    notes.set(note.id, note);
    return note;
  },

  update(id: string, updates: UpdateNoteInput): Note | undefined {
    const existing = notes.get(id);
    if (!existing) return undefined;

    const updated: Note = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    notes.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return notes.delete(id);
  },

  clear(): void {
    notes.clear();
  },
};
