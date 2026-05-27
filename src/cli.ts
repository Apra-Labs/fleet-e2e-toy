const args = process.argv.slice(2);

const HELP_TEXT = `Usage:
  tool <command> [arguments]

Commands:
  add <title>   Add a new note with the specified title
  serve         Start the NoteAPI server
  help          Show this help message

Flags:
  -v, --version Show version details
  -h, --help    Show help details`;

if (args.length === 0) {
  console.log(HELP_TEXT);
  process.exit(0);
}

const firstArg = args[0];

// Check version flags as first argument
if (firstArg === "--version" || firstArg === "-v") {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

// Check help flags/command as first argument
if (firstArg === "--help" || firstArg === "-h" || firstArg === "help") {
  console.log(HELP_TEXT);
  process.exit(0);
}

// Validate first argument is not empty or whitespace-only
if (firstArg.trim().length === 0) {
  console.error("Error: Command or argument cannot be empty or whitespace-only.");
  process.exit(1);
}

if (firstArg === "add") {
  const title = args[1];
  if (title === undefined || title.trim().length === 0) {
    console.error("Error: Note title cannot be empty or whitespace-only.");
    process.exit(1);
  }
  console.log(`Note added: ${title}`);
  process.exit(0);
} else if (firstArg === "serve") {
  console.log("Starting server...");
  process.exit(0);
} else {
  console.error(`Error: Unknown command: ${firstArg}`);
  process.exit(1);
}
