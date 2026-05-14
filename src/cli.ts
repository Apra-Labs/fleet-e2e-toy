const args = process.argv.slice(2);


for (const arg of args) {
  if (arg.trim() === "") {
    console.error("Error: Argument cannot be empty or whitespace only.");
    process.exit(1);
  }
}

function showHelp() {
  console.log("Usage: fleet-e2e-toy [options] [command]");
  console.log("");
  console.log("Options:");
  console.log("  -v, --version  Show version number");
  console.log("  -h, --help     Show help");
  console.log("");
  console.log("Commands:");
  console.log("  help           Show help");
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h") || args.includes("help")) {
  showHelp();
}

if (args.includes("--version") || args.includes("-v")) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}
