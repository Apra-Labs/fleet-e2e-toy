#!/usr/bin/env ts-node

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(0);
  }

  // Check for blank strings in arguments
  for (const arg of args) {
    if (arg.trim().length === 0) {
      console.error("Error: Arguments cannot be empty or blank strings.");
      process.exit(1);
    }
  }

  // Basic flag handling
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--version" || arg === "-v") {
      console.log("fleet-e2e-toy v1.0.0");
      process.exit(0);
    }
    if (arg === "--help" || arg === "-h" || arg === "help") {
      printUsage();
      process.exit(0);
    }
  }

  console.error(`Unknown command or flag: ${args[0]}`);
  process.exit(1);
}

function printUsage() {
  console.log("fleet-e2e-toy — A toy CLI for E2E testing");
  console.log("");
  console.log("Usage:");
  console.log("  ./tool [options] [command]");
  console.log("");
  console.log("Options:");
  console.log("  -v, --version  Print version information and exit");
  console.log("  -h, --help     Print usage information and exit");
  console.log("");
  console.log("Commands:");
  console.log("  help           Print usage information and exit");
}

main();
