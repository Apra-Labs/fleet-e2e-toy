const DISPLAY_NAME = "fleet-e2e-toy";

function getVersion(): string {
  try {
    const pkg = require("../package.json");
    return pkg.version;
  } catch (e) {
    return "unknown";
  }
}

function printHelp(): void {
  console.log(`Usage: ${DISPLAY_NAME} [command] [options]

Commands:
  help                   Show this help message

Options:
  --version, -v          Show version
  --help, -h             Show help`);
}

export function main(argv: string[]): number {
  if (argv.length === 0) {
    return 0;
  }

  const firstArg = argv[0];

  if (firstArg === "--version" || firstArg === "-v") {
    console.log(`${DISPLAY_NAME} v${getVersion()}`);
    return 0;
  }

  if (firstArg === "--help" || firstArg === "-h") {
    printHelp();
    return 0;
  }

  if (firstArg === "help") {
    printHelp();
    return 0;
  }

  // Validate positional arguments (those not beginning with -)
  for (const arg of argv) {
    if (!arg.startsWith("-")) {
      if (arg === "" || /^\s+$/.test(arg)) {
        console.error("Error: argument cannot be empty or blank");
        return 1;
      }
    }
  }

  return 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  process.exit(main(args));
}
