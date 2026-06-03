import app from "./app";

const args = process.argv.slice(2);
const isCli = process.env.RUNNING_AS_CLI === "true" || args.length > 0;

if (isCli) {
  if (args.includes("help") || args.includes("--help") || args.includes("-h")) {
    console.log("Usage: fleet-e2e-toy [command|options]");
    console.log("");
    console.log("Commands:");
    console.log("  help             Show help information");
    console.log("");
    console.log("Options:");
    console.log("  -h, --help       Show help information");
    console.log("  -v, --version    Show version information");
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }
  process.exit(0);
} else {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`NoteAPI running on http://localhost:${PORT}`);
  });
}

