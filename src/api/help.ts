import { Router } from "express";

const router = Router();

const endpoints = [
  { method: "GET", path: "/version", description: "Return the API version string." },
  { method: "GET", path: "/health", description: "Health check; returns { status: 'ok' }." },
  { method: "GET", path: "/api/help", description: "List all available endpoints." },
  { method: "GET", path: "/api/notes", description: "List notes; supports ?tag= and ?q= filters." },
  { method: "GET", path: "/api/notes/:id", description: "Get a single note by ID." },
  { method: "POST", path: "/api/notes", description: "Create a note. Body: { title, content, tags? }." },
  { method: "PUT", path: "/api/notes/:id", description: "Update a note. Body: partial { title?, content?, tags? }." },
  { method: "DELETE", path: "/api/notes/:id", description: "Delete a note by ID." }
];

router.get("/", (_req, res) => {
  res.status(200).json({ endpoints });
});

export default router;
