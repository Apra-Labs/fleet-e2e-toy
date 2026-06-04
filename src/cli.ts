import * as process from "process";

function printHelp() {
  console.log("fleet-e2e-toy v1.0.0");
  console.log("");
  console.log("Usage:");
  console.log("  tool [options] [arguments]");
  console.log("");
  console.log("Options:");
  console.log("  -v, --version  Show version information");
  console.log("  -h, --help     Show help information");
  console.log("");
  console.log("Commands:");
  console.log("  help           Show help information");
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-v") || args.includes("--version")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }

  if (args.includes("-h") || args.includes("--help") || args.includes("help")) {
    printHelp();
    process.exit(0);
  }

  if (args.some(arg => arg.trim() === "")) {
    console.error("Error: Empty or whitespace-only arguments are not allowed");
    process.exit(1);
  }

  console.log("NoteAPI CLI initialized");
  if (args.length > 0) {
    console.log("Arguments:", args.join(" "));
  }
}

main();



