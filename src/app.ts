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

export default app;
