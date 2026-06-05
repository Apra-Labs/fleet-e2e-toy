import { isBlankOrEmpty } from "./utils/validation";

export function main(argv: string[]): number {
  const isVersion = argv.includes("-v") || argv.includes("--version");
  const isHelp = argv.includes("-h") || argv.includes("--help") || argv.includes("help");

  if (isVersion) {
    console.log("fleet-e2e-toy v1.0.0");
    return 0;
  }

  if (isHelp) {
    console.log(`fleet-e2e-toy CLI

Usage:
  ./tool [command] [options]

Commands:
  help          Show this help message

Options:
  -v, --version Show version info
  -h, --help    Show this help message`);
    return 0;
  }

  if (!isVersion && !isHelp) {
    if (argv.some(isBlankOrEmpty)) {
      console.error("Error: Command-line arguments cannot be empty or blank.");
      return 1;
    }
  }

  return 0;
}


if (require.main === module) {
  const exitCode = main(process.argv.slice(2));
  process.exit(exitCode);
}

