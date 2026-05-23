const args = process.argv.slice(2);

// Check if any argument is empty or blank
if (args.some(arg => arg.trim() === '')) {
  console.error("Error: Arguments cannot be empty or blank strings.");
  process.exit(1);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h') || args.includes('help')) {
  console.log(`Usage: fleet-e2e-toy [options] [command]

Options:
  -v, --version  Show version number
  -h, --help     Show help

Commands:
  help           Show help`);
  process.exit(0);
}

// Reject unknown commands or flags
if (args.length > 0) {
  console.error(`Unknown command or flag: ${args[0]}`);
  process.exit(1);
}

