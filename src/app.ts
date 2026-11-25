import express from "express";
import notesRouter from "./api/notes";
import echoRouter from "./api/echo";

const app = express();

app.use(express.json());
app.use("/api/notes", notesRouter);
app.use("/api/echo", echoRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
