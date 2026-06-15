import app from "./app";

const PORT = process.env.PORT ?? 3000;

// Check for --version or -v flag before starting server
if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log("noteapi v1.0.0");
  process.exit(0);
}

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
