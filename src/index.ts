import app from "./app";

const PORT = process.env.PORT ?? 3000;
const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  process.stdout.write("fleet-e2e-toy v1.0.0\n");
  process.exit(0);
}

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
