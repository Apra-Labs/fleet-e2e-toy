import { ApiError } from "./apiClient";

/**
 * Parsed shape of the CLI invocation. Flags are collected as key/value pairs
 * (`--key value` or `--key=value`); bare `--flag` becomes `{ flag: "true" }`.
 */
export interface ParsedArgs {
  subcommand: string | undefined;
  flags: Record<string, string>;
  positionals: string[];
}

/**
 * Hand-rolled argv parser (no external dependency). Splits the arguments into a
 * subcommand, a flag map, and remaining positionals.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string> = {};
  const positionals: string[] = [];
  let subcommand: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith("--")) {
      const body = arg.slice(2);
      const eq = body.indexOf("=");
      if (eq >= 0) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          flags[body] = next;
          i++;
        } else {
          flags[body] = "true";
        }
      }
      continue;
    }

    if (subcommand === undefined) {
      subcommand = arg;
    } else {
      positionals.push(arg);
    }
  }

  return { subcommand, flags, positionals };
}

/** Signature every subcommand handler implements. Returns a process exit code. */
export type CommandHandler = (args: ParsedArgs) => Promise<number> | number;

/**
 * Stub handlers for each CRUD subcommand. Later tasks (gh-toy-mi2.2 and
 * gh-toy-mi2.3) replace these stubs with real implementations.
 */
function makeStub(name: string): CommandHandler {
  return () => {
    process.stderr.write(`'${name}' is not implemented yet.\n`);
    return 1;
  };
}

/** Dispatch table mapping subcommand names to their handlers. */
export const commands: Record<string, CommandHandler> = {
  list: makeStub("list"),
  read: makeStub("read"),
  create: makeStub("create"),
  update: makeStub("update"),
  delete: makeStub("delete"),
};

const VERSION = "1.0.0";

function printHelp(): void {
  const lines = [
    "Usage: noteapi <command> [options]",
    "",
    "Commands:",
    "  list                 List notes (optional --tag, --q filters)",
    "  read <id>            Show a single note by id",
    "  create              Create a note (--title, --content, --tags)",
    "  update <id>         Update a note",
    "  delete <id>         Delete a note",
    "",
    "Options:",
    "  --help, -h          Show this help text",
    "  --version, -v       Show the CLI version",
    "",
    "Environment:",
    "  NOTEAPI_URL         Base URL of the API (default http://localhost:3000)",
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
}

/**
 * Runs the CLI: parses argv, handles --help/--version, dispatches to the
 * matching subcommand, and normalizes errors into exit codes. Never prints a
 * stack trace to the user.
 */
export async function run(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);

  if (parsed.flags.help !== undefined || parsed.flags.h !== undefined || parsed.subcommand === "help") {
    printHelp();
    return 0;
  }

  if (parsed.flags.version !== undefined || parsed.flags.v !== undefined) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  if (parsed.subcommand === undefined) {
    process.stderr.write("No command given. Run 'noteapi --help' for usage.\n");
    return 1;
  }

  const handler = commands[parsed.subcommand];
  if (!handler) {
    process.stderr.write(
      `Unknown command '${parsed.subcommand}'. Run 'noteapi --help' for usage.\n`
    );
    return 1;
  }

  try {
    return await handler(parsed);
  } catch (err) {
    if (err instanceof ApiError) {
      process.stderr.write(`Error: ${err.message}\n`);
    } else {
      const detail = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Error: ${detail}\n`);
    }
    return 1;
  }
}

// Entrypoint guard: only auto-run when invoked directly, not when imported.
if (require.main === module) {
  run(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((err) => {
      const detail = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Error: ${detail}\n`);
      process.exitCode = 1;
    });
}
