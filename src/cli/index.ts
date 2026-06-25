import { VERSION } from "./version";
import { runList } from "./commands/list";
import { runRead } from "./commands/read";

export interface CliResult {
  stdout: string;
  stderr?: string;
  exitCode: number;
}

/**
 * Synchronous fast-path for flags that do not need the network.
 * Returns a CliResult for --version/-v.
 * Returns null if the subcommand requires async dispatch.
 */
export function runCli(argv: string[]): CliResult {
  if (argv.includes("--version") || argv.includes("-v")) {
    return { stdout: VERSION, exitCode: 0 };
  }

  const subcommand = argv[0];

  if (subcommand === "list" || subcommand === "read") {
    // These require async — callers that need async should use runCliAsync.
    // For the synchronous interface, signal that async is needed.
    return {
      stdout: "",
      stderr: `Subcommand '${subcommand}' requires async execution. Use runCliAsync().`,
      exitCode: 1,
    };
  }

  return {
    stdout: "fleet-e2e-toy CLI — use --version or -v for version info",
    exitCode: 0,
  };
}

/**
 * Async CLI dispatcher — handles all subcommands including those that
 * call the NoteAPI.
 */
export async function runCliAsync(argv: string[]): Promise<CliResult> {
  if (argv.includes("--version") || argv.includes("-v")) {
    return { stdout: VERSION, exitCode: 0 };
  }

  const subcommand = argv[0];
  const rest = argv.slice(1);

  switch (subcommand) {
    case "list":
      return runList(rest);

    case "read":
      return runRead(rest);

    default:
      return {
        stdout: "fleet-e2e-toy CLI — use --version or -v for version info",
        exitCode: 0,
      };
  }
}

// Run as a script
if (require.main === module) {
  const args = process.argv.slice(2);
  runCliAsync(args)
    .then((result) => {
      if (result.stdout) {
        process.stdout.write(result.stdout + "\n");
      }
      if (result.stderr) {
        process.stderr.write(result.stderr + "\n");
      }
      process.exit(result.exitCode);
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Unexpected error: ${message}\n`);
      process.exit(1);
    });
}
