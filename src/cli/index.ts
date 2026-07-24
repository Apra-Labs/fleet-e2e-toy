#!/usr/bin/env node
import { listCommand } from "./commands/list";
import { readCommand } from "./commands/read";
import { createCommand } from "./commands/create";
import { updateCommand } from "./commands/update";
import { deleteCommand } from "./commands/delete";
import { SubcommandName, hasHelpFlag, isHelpFlag, printGlobalUsage, printSubcommandUsage } from "./help";
import { isVersionFlag, printVersion } from "./version";

export type CommandHandler = (args: string[]) => Promise<void>;

const commands: Record<SubcommandName, CommandHandler> = {
  list: listCommand,
  read: readCommand,
  create: createCommand,
  update: updateCommand,
  delete: deleteCommand,
};

function printUsage(): void {
  const names = Object.keys(commands).join("|");
  console.error(`Usage: noteapi-cli <${names}> [args]`);
}

export async function run(argv: string[]): Promise<number> {
  const [subcommand, ...rest] = argv;

  if (subcommand && isVersionFlag(subcommand)) {
    printVersion();
    return 0;
  }

  if (subcommand && isHelpFlag(subcommand)) {
    printGlobalUsage();
    return 0;
  }

  if (!subcommand || !(subcommand in commands)) {
    printUsage();
    return 1;
  }

  if (hasHelpFlag(rest)) {
    printSubcommandUsage(subcommand as SubcommandName);
    return 0;
  }

  try {
    await commands[subcommand as SubcommandName](rest);
    return 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error: ${message}`);
    return 1;
  }
}

/* istanbul ignore next -- exercised via CLI invocation, not unit tests */
if (require.main === module) {
  run(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
