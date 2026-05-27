const args = process.argv.slice(2);

// Check version flags first
if (args.includes("--version") || args.includes("-v")) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

// Validate first argument is not empty or whitespace-only
if (args.length === 0 || args[0].trim().length === 0) {
  console.error("Error: Command or argument cannot be empty or whitespace-only.");
  process.exit(1);
}

const command = args[0];

if (command === "add") {
  const title = args[1];
  if (!title || title.trim().length === 0) {
    console.error("Error: Note title cannot be empty or whitespace-only.");
    process.exit(1);
  }
  console.log(`Note added: ${title}`);
  process.exit(0);
} else if (command === "serve") {
  console.log("Starting server...");
  process.exit(0);
} else {
  // Stub unknown commands or help command (to be fully implemented in next task)
  if (command === "help" || command === "--help" || command === "-h") {
    console.log("Usage details...");
    process.exit(0);
  } else {
    console.error(`Error: Unknown command: ${command}`);
    process.exit(1);
  }
}
