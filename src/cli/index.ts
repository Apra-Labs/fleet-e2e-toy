import { VERSION } from "./version";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(VERSION);
  process.exit(0);
}

// Stub: dispatch to subcommands in the future
console.log("fleet-e2e-toy CLI — use --version or -v for version info");
