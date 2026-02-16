import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { noteStore, Note } from "../models/note";
import { validateCreateInput, validateUpdateInput } from "../utils/validation";

const router = Router();

// TODO: Add pagination to GET /api/notes (query params: page, limit)
// TODO: Add input length validation (title max 200 chars, content max 10000 chars)
// TODO: Return 400 if tags array contains duplicates
// TODO: Add updatedAt timestamp on PUT (currently not updated)

// List all notes, with optional tag filter and search
router.get("/", (req: Request, res: Response) => {
  let notes = noteStore.getAll();

  const tag = req.query.tag as string | undefined;
  if (tag) {
    notes = notes.filter((n) => n.tags.includes(tag));
  }

  const q = req.query.q as string | undefined;
  if (q) {
    const lower = q.toLowerCase();
    notes = notes.filter(
      (n) => n.title.toLowerCase().includes(lower) || n.content.toLowerCase().includes(lower)
    );
  }

  res.json(notes);
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
