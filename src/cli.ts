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
    } else if (firstArg === "help" || firstArg === "--help" || firstArg === "-h") {
      console.log("Usage: fleet-e2e-toy [command] [options]\n\n" +
                  "Commands:\n" +
                  "  help             Show this help message\n\n" +
                  "Options:\n" +
                  "  --version, -v    Show version information\n" +
                  "  --help, -h       Show this help message");
      process.exit(0);
    } else {
      console.error(`Unknown command or flag: ${firstArg}`);
      process.exit(1);
    }
  }
}

main();
