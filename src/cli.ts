import app from "./app";
import { isBlankOrEmpty } from "./utils/validation";

const args = process.argv.slice(2);

// Check if any argument is blank or empty
for (const arg of args) {
  if (isBlankOrEmpty(arg)) {
    console.error("Error: Arguments cannot be empty or whitespace-only.");
    process.exit(1);
  }
}

// Check for help first (precedence)
if (args.includes("help") || args.includes("--help") || args.includes("-h")) {
  const helpMessage = `fleet-e2e-toy — NoteAPI CLI

Usage:
  ./tool [command] [flags]

Commands:
  help              Show this help message

Flags:
  --help, -h        Show this help message
  --version, -v     Print version and exit`;
  console.log(helpMessage);
  process.exit(0);
} else if (args.includes("--version") || args.includes("-v")) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
} else {
  // Start server
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`NoteAPI running on http://localhost:${PORT}`);
  });
}
