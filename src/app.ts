import express from "express";
import notesRouter from "./api/notes";
import metaRouter from "./api/meta";

const app = express();

app.use(express.json());
app.use("/api/notes", notesRouter);
app.use("/", metaRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
