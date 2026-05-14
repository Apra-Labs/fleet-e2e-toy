const VERSION = "fleet-e2e-toy v1.0.0";

const HELP_TEXT = `Usage: fleet-e2e-toy [command] [options] [arguments]

Commands:
  help                Show this help message
  serve               Start the API server (default)

Flags:
  --version, -v       Print version and exit
  --help, -h          Show this help message
  --port <number>     Port to listen on (default: 3000)`;

export function parseArgs(argv: string[]): { action: string; args: string[] } {
  const args = argv.slice(2);

  if (args.includes("--version") || args.includes("-v")) {
    return { action: "version", args: [] };
  }

  if (args.includes("--help") || args.includes("-h") || args[0] === "help") {
    return { action: "help", args: [] };
  }

  const positional = args.filter((a) => !a.startsWith("-"));
  return { action: "serve", args: positional };
}

export function validateStringArg(value: string): string | null {
  if (value.trim().length === 0) {
    return "Error: argument must not be empty or whitespace-only";
  }
  return null;
}

export function run(argv: string[]): number {
  const parsed = parseArgs(argv);

  switch (parsed.action) {
    case "version":
      console.log(VERSION);
      return 0;

    case "help":
      console.log(HELP_TEXT);
      return 0;

    case "serve": {
      for (const arg of parsed.args) {
        const error = validateStringArg(arg);
        if (error) {
          console.error(error);
          return 1;
        }
      }
      return 0;
    }

    default:
      return 0;
  }
}

if (require.main === module) {
  const code = run(process.argv);
  process.exit(code);
}
