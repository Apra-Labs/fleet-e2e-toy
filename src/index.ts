import app from "./app";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h") || args.includes("help")) {
  console.log(`Usage: fleet-e2e-toy [command] [options]

Commands:
  help      Display help information

Options:
  -v, --version  Show version number
  -h, --help     Show help information

If no command is provided, the NoteAPI server will start.`);
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
