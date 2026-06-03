import express from "express";
import notesRouter from "./api/notes";
import versionRouter from "./api/version";

const app = express();

app.use(express.json());
app.use("/api/notes", notesRouter);
app.use("/version", versionRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
