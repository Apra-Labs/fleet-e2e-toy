import app from "./app";
import { version } from "../package.json";

const args = process.argv.slice(2);

if (args.includes("--version")) {
  console.log(`v${version}`);
  process.exit(0);
}

if (args.includes("help")) {
  console.log("NoteAPI - A simple REST API for managing notes");
  console.log("");
  console.log("Usage:");
  console.log("  npm start             Start the server");
  console.log("  npm start -- --version  Show version information");
  console.log("  npm start -- help       Show this help message");
  console.log("");
  console.log("Environment Variables:");
  console.log("  PORT  Port to listen on (default: 3000)");
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});

// Updated during e2e sprint
