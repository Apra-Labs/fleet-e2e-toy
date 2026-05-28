import app from "./app";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

if (args.includes("help") || args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: ts-node src/index.ts [command|flag]

Commands:
  help          Show this help message

Flags:
  --help, -h    Show this help message
  --version, -v Print version and exit

Default:
  (no args)     Start the NoteAPI server on port 3000`);
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
