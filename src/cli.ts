import * as process from "process";

function main() {
  const args = process.argv.slice(2);

  for (const arg of args) {
    if (arg.trim() === "") {
      console.error("Error: Argument cannot be empty or whitespace-only.");
      process.exit(1);
    }
  }

  if (args.length > 0) {
    const firstArg = args[0];
    if (firstArg === "--version" || firstArg === "-v") {
      console.log("fleet-e2e-toy v1.0.0");
      process.exit(0);
    }
  }
}

main();
