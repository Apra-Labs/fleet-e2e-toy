import express from "express";
import notesRouter from "./api/notes";

const app = express();

app.use(express.json());
app.use("/api/notes", notesRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Liveness ping
app.get("/api/ping", (_req, res) => {
  res.status(200).json({ pong: true });
});

export default app;
