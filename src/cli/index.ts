import { VERSION } from "./version";

export interface CliResult {
  stdout: string;
  exitCode: number;
}

export function runCli(argv: string[]): CliResult {
  if (argv.includes("--version") || argv.includes("-v")) {
    return { stdout: VERSION, exitCode: 0 };
  }

  return {
    stdout: "fleet-e2e-toy CLI — use --version or -v for version info",
    exitCode: 0,
  };
}

// Run as a script
if (require.main === module) {
  const args = process.argv.slice(2);
  const result = runCli(args);
  console.log(result.stdout);
  process.exit(result.exitCode);
}
