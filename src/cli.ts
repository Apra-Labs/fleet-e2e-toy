#!/usr/bin/env node
import { parseArgs, hasFlag } from "./cli/args";
import { runList, runRead, runCreate, runUpdate, runDelete } from "./cli/commands/notes";

const CLI_NAME = "fleet-e2e-toy";
const CLI_VERSION = "1.0.0";

function printGlobalUsage(): void {
  const usage = `Usage: ${CLI_NAME} [COMMAND] [OPTIONS]

Global flags:
  --help, -h     Show this help message
  --version, -v  Show version

Commands:
  list           List all notes
  read           Read a note by ID
  create         Create a new note
  update         Update an existing note
  delete         Delete a note

Run '${CLI_NAME} COMMAND --help' for more information on a command.
`;
  process.stdout.write(usage);
}

export async function main(argv: string[]): Promise<number> {
  const { positionals, flags } = parseArgs(argv);

  if (hasFlag(flags, "version", "v")) {
    process.stdout.write(`${CLI_NAME} v${CLI_VERSION}\n`);
    return 0;
  }

  const command = positionals[0];
  const parsed = { positionals: positionals.slice(1), flags };

  // Check for global --help/-h only if no command is provided
  if (command === undefined && hasFlag(flags, "help", "h")) {
    printGlobalUsage();
    return 0;
  }

  switch (command) {
    case "list":
      return runList(parsed);
    case "read":
      return runRead(parsed);
    case "create":
      return runCreate(parsed);
    case "update":
      return runUpdate(parsed);
    case "delete":
      return runDelete(parsed);
    case undefined:
      printGlobalUsage();
      return 0;
    default:
      process.stderr.write(`Error: unknown command '${command}'\n`);
      return 1;
  }
}

/* istanbul ignore next -- exercised via process spawn in tests, not unit coverage */
if (require.main === module) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
