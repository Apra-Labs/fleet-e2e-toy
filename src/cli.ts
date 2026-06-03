// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../package.json") as { name: string; version: string };

const HELP_TEXT = `${pkg.name} — REST API for managing notes with tags and search

Usage:
  ts-node src/index.ts [options]

Options:
  --help, -h       Show this help message and exit
  --version, -v    Print version and exit

Environment:
  PORT             Port to listen on (default: 3000)`;

export function runCli(argv: string[]): { handled: boolean; exitCode: number } {
  const args = argv.slice(2);

  // --help / -h wins; also treat positional "help" as --help
  if (
    args.includes("--help") ||
    args.includes("-h") ||
    argv[2] === "help"
  ) {
    console.log(HELP_TEXT);
    return { handled: true, exitCode: 0 };
  }

  // --version / -v
  if (args.includes("--version") || args.includes("-v")) {
    console.log(`${pkg.name} v${pkg.version}`);
    return { handled: true, exitCode: 0 };
  }

  return { handled: false, exitCode: 0 };
}
