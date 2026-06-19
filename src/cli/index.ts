import { parseArgs } from "./parser";
import { printHelp } from "./help";
import { getVersion } from "./version";
import { listCommand } from "./commands/list";
import { readCommand } from "./commands/read";
import { createCommand } from "./commands/create";
import { updateCommand } from "./commands/update";
import { deleteCommand } from "./commands/delete";

function main(): void {
  const args = parseArgs(process.argv);

  // Check for --version / -v before any subcommand dispatch
  if (args.flags.version || args.flags["v"]) {
    process.stdout.write(`fleet-e2e-toy v${getVersion()}\n`);
    process.exit(0);
  }

  // Check for --help / -h before subcommand dispatch
  if (args.flags.help || args.flags["h"]) {
    printHelp(args.subcommand || undefined);
    process.exit(0);
  }

  switch (args.subcommand) {
    case "list":
      listCommand(args).catch(() => process.exit(1));
      break;
    case "read":
      readCommand(args).catch(() => process.exit(1));
      break;
    case "create":
      createCommand(args).catch(() => process.exit(1));
      break;
    case "update":
      updateCommand(args).catch(() => process.exit(1));
      break;
    case "delete":
      deleteCommand(args).catch(() => process.exit(1));
      break;
    default:
      if (args.subcommand === "") {
        printHelp();
        process.exit(0);
      } else {
        process.stderr.write(`Unknown subcommand: ${args.subcommand}\n`);
        process.exit(1);
      }
  }
}

main();
