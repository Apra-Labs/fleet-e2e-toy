import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { noteStore, Note } from "../models/note";
import { validateCreateInput, validateUpdateInput } from "../utils/validation";

const router = Router();

// TODO: Add input length validation (title max 200 chars, content max 10000 chars)
// TODO: Return 400 if tags array contains duplicates
// TODO: Add updatedAt timestamp on PUT (currently not updated)

// List all notes, with optional tag filter, search, and pagination
router.get("/", (req: Request, res: Response) => {
  const pageParam = req.query.page as string | undefined;
  const limitParam = req.query.limit as string | undefined;

  let page = 1;
  let limit = 10;

  if (pageParam !== undefined) {
    page = Number(pageParam);
    if (!Number.isInteger(page) || page < 1) {
      res.status(400).json({ error: "page must be a positive integer" });
      return;
    }
  }

  if (limitParam !== undefined) {
    limit = Number(limitParam);
    if (!Number.isInteger(limit) || limit < 1) {
      res.status(400).json({ error: "limit must be a positive integer" });
      return;
    }
  }

  let notes = noteStore.getAll();

  const tag = req.query.tag as string | undefined;
  if (tag) {
    notes = notes.filter((n) => n.tags.includes(tag));
  }

  const includeArchived = req.query.include_archived === "true";
  if (!includeArchived) {
    notes = notes.filter((n) => !n.archived);
  }

  const q = req.query.q as string | undefined;
  if (q && q.trim()) {
    const lower = q.toLowerCase();
    notes = notes.filter(
      (n) => n.title.toLowerCase().includes(lower) || n.content.toLowerCase().includes(lower)
    );
  }

  const total = notes.length;
  const start = (page - 1) * limit;
  const paginatedNotes = notes.slice(start, start + limit);

  res.json({ data: paginatedNotes, total, page, limit });
});

// Get a single note by ID
router.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const note = noteStore.getById(req.params.id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

// Create a new note
router.post("/", (req: Request, res: Response) => {
  const result = validateCreateInput(req.body);
  if (!result.valid) {
    res.status(400).json({ errors: result.errors });
    return;
  }

  const now = new Date().toISOString();
  const note: Note = {
    id: uuidv4(),
    ...result.data,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  noteStore.create(note);
  res.status(201).json(note);
});

// Update an existing note
router.put("/:id", (req: Request<{ id: string }>, res: Response) => {
  const existing = noteStore.getById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const result = validateUpdateInput(req.body);
  if (!result.valid) {
    res.status(400).json({ errors: result.errors });
    return;
  }

  const updated = noteStore.update(req.params.id, result.data);
  res.json(updated);
});

// Archive a note
router.post("/:id/archive", (req: Request<{ id: string }>, res: Response) => {
  const note = noteStore.archive(req.params.id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

// Unarchive a note
router.post("/:id/unarchive", (req: Request<{ id: string }>, res: Response) => {
  const note = noteStore.unarchive(req.params.id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

// Delete a note
router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const deleted = noteStore.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.status(204).send();
});

export default router;
