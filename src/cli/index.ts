import { ApiError } from "./apiClient";
import { ValidationError } from "./validate";
import { ParsedArgs, CommandHandler } from "./types";
import { globalHelpText, subcommandHelpText } from "./help";
import { listCommand } from "./commands/list";
import { readCommand } from "./commands/read";
import { createCommand } from "./commands/create";
import { updateCommand } from "./commands/update";
import { deleteCommand } from "./commands/delete";

export { ParsedArgs, CommandHandler };

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

    // Single-dash short flags (e.g. -v, -h) are recognized as bare boolean
    // flags; they never take a value.
    if (/^-[a-zA-Z]$/.test(arg)) {
      flags[arg.slice(1)] = "true";
      continue;
    }

    if (subcommand === undefined) {
      subcommand = arg;
    } else {
      positionals.push(arg);
    }
  }

  return { subcommand, flags, positionals, rawArgv: argv };
}

/** Dispatch table mapping subcommand names to their handlers. */
export const commands: Record<string, CommandHandler> = {
  list: listCommand,
  read: readCommand,
  create: createCommand,
  update: updateCommand,
  delete: deleteCommand,
};

/** Fixed version prefix; the printed string is always `${VERSION_PREFIX}${VERSION}`. */
const VERSION_PREFIX = "fleet-e2e-toy v";
const VERSION = "1.0.0";

/**
 * Runs the CLI: parses argv, handles --help/--version, dispatches to the
 * matching subcommand, and normalizes errors into exit codes. Never prints a
 * stack trace to the user.
 */
export async function run(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);

  // --version/-v short-circuits before anything else, including help and
  // subcommand dispatch.
  if (parsed.flags.version !== undefined || parsed.flags.v !== undefined) {
    process.stdout.write(`${VERSION_PREFIX}${VERSION}\n`);
    return 0;
  }

  const wantsHelp = parsed.flags.help !== undefined || parsed.flags.h !== undefined;

  // Per-subcommand help: `cli <subcommand> --help` prints that subcommand's
  // usage instead of the global usage, and never runs the handler.
  if (wantsHelp && parsed.subcommand !== undefined) {
    const text = subcommandHelpText(parsed.subcommand);
    if (text !== undefined) {
      process.stdout.write(`${text}\n`);
      return 0;
    }
  }

  if (wantsHelp || parsed.subcommand === "help") {
    process.stdout.write(`${globalHelpText()}\n`);
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
    if (err instanceof ValidationError) {
      process.stderr.write(`Error: ${err.message}\n`);
    } else if (err instanceof ApiError) {
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
