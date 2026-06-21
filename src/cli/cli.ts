import { parseArgs } from "./parse";
import { CliError, ParsedArgs } from "./types";

type CommandHandler = (parsed: ParsedArgs) => Promise<void>;

const commandMap: Record<string, CommandHandler> = {
  list: async (_parsed: ParsedArgs): Promise<void> => {
    throw new CliError("not implemented");
  },
  get: async (_parsed: ParsedArgs): Promise<void> => {
    throw new CliError("not implemented");
  },
  create: async (_parsed: ParsedArgs): Promise<void> => {
    throw new CliError("not implemented");
  },
  update: async (_parsed: ParsedArgs): Promise<void> => {
    throw new CliError("not implemented");
  },
  delete: async (_parsed: ParsedArgs): Promise<void> => {
    throw new CliError("not implemented");
  },
};

export async function main(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);

  if (!parsed.command) {
    process.stderr.write(JSON.stringify({ error: "No command specified. Run with a valid command." }) + "\n");
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
