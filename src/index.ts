import app from "./app";

const VERSION = "1.0.0";

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(`fleet-e2e-toy v${VERSION}`);
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
