import express from "express";
import notesRouter from "./api/notes";
import pingRouter from "./api/ping";
import timeRouter from "./api/time";

const app = express();

app.use(express.json());
app.use("/api/notes", notesRouter);
app.use("/api/ping", pingRouter);
app.use("/api/time", timeRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
