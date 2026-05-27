const args = process.argv.slice(2);

// Check version flags first
if (args.includes("--version") || args.includes("-v")) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

// Check help flags and help command
if (args.includes("--help") || args.includes("-h") || args.includes("help")) {
  console.log(`Usage:
  tool <command> [arguments]

Commands:
  add <title>   Add a new note with the specified title
  serve         Start the NoteAPI server
  help          Show this help message

Flags:
  -v, --version Show version details
  -h, --help    Show help details`);
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
  console.error(`Error: Unknown command: ${command}`);
  process.exit(1);
}
