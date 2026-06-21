import { parseArgs } from "./parse";
import { CliError, ParsedArgs } from "./types";
import { printVersion } from "./version";
import { printGlobalHelp, printCommandHelp } from "./help";
import { listCommand } from "./commands/list";
import { readCommand } from "./commands/read";
import { createCommand } from "./commands/create";
import { updateCommand } from "./commands/update";
import { deleteCommand } from "./commands/delete";

type CommandHandler = (parsed: ParsedArgs) => Promise<void>;

const commandMap: Record<string, CommandHandler> = {
  list: listCommand,
  read: readCommand,
  get: readCommand,
  create: createCommand,
  update: updateCommand,
  delete: deleteCommand,
};

export async function main(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);

  // --version / -v: print version and exit
  if (parsed.flags["version"] === true || parsed.flags["v"] === true) {
    printVersion();
    return 0;
  }

  // --help / -h: print help and exit
  if (parsed.flags["help"] === true || parsed.flags["h"] === true) {
    if (parsed.command && commandMap[parsed.command]) {
      printCommandHelp(parsed.command);
    } else {
      printGlobalHelp();
    }
    return 0;
  }

  // No command given: print global help and exit non-zero
  if (!parsed.command) {
    printGlobalHelp();
    return 1;
  }

  const handler = commandMap[parsed.command];
  if (!handler) {
    process.stderr.write(JSON.stringify({ error: `Unknown command: ${parsed.command}` }) + "\n");
    return 1;
  }

  try {
    await handler(parsed);
    return 0;
  } catch (err) {
    // Errors are always JSON-formatted (even without --json flag, per convention)
    if (err instanceof CliError) {
      process.stderr.write(JSON.stringify({ error: err.message }) + "\n");
    } else {
      process.stderr.write(JSON.stringify({ error: "An unexpected error occurred" }) + "\n");
    }
    return 1;
  }
}

// Entry point when run directly
if (require.main === module) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch(() => {
      process.exitCode = 1;
    });
}
