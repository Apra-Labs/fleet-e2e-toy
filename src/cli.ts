import app from "./app";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
