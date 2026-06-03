const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

if (args.includes("help") || args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: tool [command] [options]

Commands:
  serve          Start the NoteAPI server (default)
  help           Display help information

Options:
  -v, --version  Display version information
  -h, --help     Display help information`);
  process.exit(0);
}

console.log("NoteAPI CLI");


