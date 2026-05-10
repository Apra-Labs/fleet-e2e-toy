import pkg from "../package.json";
import { validateCliArg } from "./utils/validation";

function getHelpOutput(): string {
  return `fleet-e2e-toy CLI

SUBCOMMANDS:
  help                 Show this help message

FLAGS:
  --version, -v        Show version
  --help, -h           Show this help message
`;
}

export function runCli(args: string[]): { exitCode: number; output: string } {
  if (args.includes("--version") || args.includes("-v")) {
    return {
      exitCode: 0,
      output: `fleet-e2e-toy v${pkg.version}`,
    };
  }

  if (args.includes("--help") || args.includes("-h")) {
    return {
      exitCode: 0,
      output: getHelpOutput(),
    };
  }

  const positionalArgs = args.filter((arg) => !arg.startsWith("-"));
  if (positionalArgs.length > 0 && positionalArgs[0] === "help") {
    return {
      exitCode: 0,
      output: getHelpOutput(),
    };
  }

  for (const arg of positionalArgs) {
    const error = validateCliArg(arg);
    if (error) {
      return {
        exitCode: 1,
        output: error,
      };
    }
  }

  return {
    exitCode: 0,
    output: "",
  };
}

if (require.main === module) {
  const result = runCli(process.argv.slice(2));
  if (result.output) {
    console.log(result.output);
  }
  process.exit(result.exitCode);
}
