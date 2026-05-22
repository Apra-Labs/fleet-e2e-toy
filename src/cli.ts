import * as process from "process";

function main() {
  const args = process.argv.slice(2);

  // Task 2: Validate that none of the arguments are empty or contain only whitespace
  const hasEmptyOrBlank = args.some(arg => arg.trim() === "");
  if (hasEmptyOrBlank) {
    console.error("Error: Arguments cannot be empty or blank strings.");
    process.exit(1);
  }

  const allowedArgs = ["--version", "-v", "--help", "-h", "help"];

  // Check for unknown commands or flags
  for (const arg of args) {
    if (!allowedArgs.includes(arg)) {
      console.error(`Unknown command or flag: ${arg}`);
      process.exit(1);
    }
  }

  // Task 1: Add --version / -v flag
  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }

  // Task 3: Implement help command and help flags
  if (args.length === 0 || args.includes("help") || args.includes("--help") || args.includes("-h")) {
    console.log("Usage: fleet-e2e-toy [command] [options]");
    console.log("");
    console.log("Commands:");
    console.log("  help           Display help information");
    console.log("");
    console.log("Options:");
    console.log("  -v, --version  Display version information");
    console.log("  -h, --help     Display help information");
    process.exit(0);
  }
}

main();
