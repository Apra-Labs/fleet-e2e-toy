#!/usr/bin/env node
import { parseArgs, hasFlag } from "./cli/args";
import { runList, runRead, runCreate, runUpdate, runDelete } from "./cli/commands/notes";

const CLI_NAME = "fleet-e2e-toy";
const CLI_VERSION = "1.0.0";

export async function main(argv: string[]): Promise<number> {
  const { positionals, flags } = parseArgs(argv);

  if (hasFlag(flags, "version", "v")) {
    process.stdout.write(`${CLI_NAME} v${CLI_VERSION}\n`);
    return 0;
  }

  const command = positionals[0];
  const parsed = { positionals: positionals.slice(1), flags };

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
      process.stderr.write("Error: no command provided\n");
      return 1;
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
