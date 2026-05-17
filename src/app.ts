import express from "express";
import notesRouter from "./api/notes";
import pkg from "../package.json";

const app = express();

app.use(express.json());
app.use("/api/notes", notesRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/version", (_req, res) => {
  res.json({ name: "fleet-e2e-toy", version: pkg.version });
});

app.get("/help", (_req, res) => {
  res.json({
    routes: [
      { method: "GET", path: "/health", description: "Health check — returns service status" },
      { method: "GET", path: "/version", description: "Returns service name and version" },
      { method: "GET", path: "/help", description: "Lists all available API routes" },
      { method: "GET", path: "/api/notes", description: "List all notes; supports ?tag= and ?q= filters" },
      { method: "GET", path: "/api/notes/:id", description: "Get a single note by ID" },
      {
        method: "POST",
        path: "/api/notes",
        description: "Create a new note",
        requestBody: { title: "string", content: "string", tags: "string[]" },
        responseShape: { id: "string", title: "string", content: "string", tags: "string[]", createdAt: "string", updatedAt: "string" },
      },
      {
        method: "PUT",
        path: "/api/notes/:id",
        description: "Update an existing note by ID",
        requestBody: { title: "string (optional)", content: "string (optional)", tags: "string[] (optional)" },
      },
      { method: "DELETE", path: "/api/notes/:id", description: "Delete a note by ID" },
    ],
  });
});

export default app;
