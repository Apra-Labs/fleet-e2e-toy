import express from "express";
import notesRouter from "./api/notes";

const app = express();

app.use(express.json());
app.use("/api/notes", notesRouter);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

export default app;
