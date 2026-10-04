import app from "./app";
import { findBlankArgs } from "./utils/validation";

const PORT = process.env.PORT ?? 3000;
const args = process.argv.slice(2);

const blankArgs = findBlankArgs(args);
if (blankArgs.length > 0) {
  process.stderr.write(
    `Error: arguments must not be empty or whitespace-only (got a blank argument at position ${blankArgs[0] + 1})\n`
  );
  process.exit(1);
}

if (args.includes("--version") || args.includes("-v")) {
  process.stdout.write("fleet-e2e-toy v1.0.0\n");
  process.exit(0);
}

const server = app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});

process.once("SIGINT", () => {
  process.stderr.write("Interrupted.\n");
  server.close(() => process.exit(130));
  // Keep-alive connections can stall close; do not wait indefinitely.
  setTimeout(() => process.exit(130), 500).unref();
});
