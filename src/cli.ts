import pkg from "../package.json";
import { validateCliArg } from "./utils/validation";

export function runCli(args: string[]): { exitCode: number; output: string } {
  if (args.includes("--version") || args.includes("-v")) {
    return {
      exitCode: 0,
      output: `fleet-e2e-toy v${pkg.version}`,
    };
  }

  const positionalArgs = args.filter((arg) => !arg.startsWith("-"));
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
