import * as process from "process";

function main() {
  const args = process.argv.slice(2);

  // Task 1: Add --version / -v flag
  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }
}

main();
