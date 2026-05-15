import { validateString } from "./utils/validation";

export function runCLI(args: string[]) {
  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }

  if (args.includes("--help") || args.includes("-h") || args.includes("help")) {
    console.log("Usage: fleet-e2e-toy [options] [command] [argument]");
    console.log("");
    console.log("Options:");
    console.log("  -v, --version  Print version information");
    console.log("  -h, --help     Print help information");
    console.log("");
    console.log("Commands:");
    console.log("  help           Print help information");
    process.exit(0);
  }

  if (args.length > 0) {
    const arg = args[0];
    if (!validateString(arg)) {
      console.error("Error: Input cannot be empty or whitespace only.");
      process.exit(1);
    }
  }
}
