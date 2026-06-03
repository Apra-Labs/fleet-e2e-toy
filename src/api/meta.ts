import { Router, Request, Response } from "express";

// NOTE: VERSION is hardcoded here because tsconfig.json has rootDir: "./src" and include: ["src/**/*"],
// which prevents importing ../../package.json (TS6059). If package.json version changes, update this
// constant in lockstep.
const NAME = "fleet-e2e-toy";
const VERSION = "1.0.0";

const router = Router();

router.get("/version", (_req: Request, res: Response) => {
  res.status(200).json({
    name: NAME,
    version: VERSION,
    display: `${NAME} v${VERSION}`,
  });
});

router.get("/help", (_req: Request, res: Response) => {
  res.status(200).json({
    name: NAME,
    version: VERSION,
    description: "REST API for managing notes with tags and search",
    endpoints: [
      { method: "GET", path: "/health", description: "Health check" },
      { method: "GET", path: "/version", description: "Print version info" },
      { method: "GET", path: "/help", description: "Print this help message" },
      { method: "GET", path: "/api/notes", description: "List notes; optional ?tag=&q=" },
      { method: "GET", path: "/api/notes/:id", description: "Get one note by id" },
      { method: "POST", path: "/api/notes", description: "Create a note; body { title, content, tags? }" },
      { method: "PUT", path: "/api/notes/:id", description: "Update a note (partial)" },
      { method: "DELETE", path: "/api/notes/:id", description: "Delete a note" },
    ],
  });
});

export default router;
