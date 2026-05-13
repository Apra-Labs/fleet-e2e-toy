import app from "./app";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  process.stdout.write("fleet-e2e-toy v1.0.0\n");
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h") || args[0] === "help") {
  process.stdout.write(
    "Usage: node src/index.ts [options]\n" +
    "\n" +
    "Options:\n" +
    "  --version, -v    Print version and exit\n" +
    "  --help, -h       Print this help message and exit\n" +
    "\n" +
    "Subcommands:\n" +
    "  help             Print this help message and exit\n" +
    "\n" +
    "Environment Variables:\n" +
    "  PORT             Port to listen on (default: 3000)\n"
  );
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
