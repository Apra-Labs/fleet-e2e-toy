#!/usr/bin/env ts-node
import { parseArgs } from "./args";
import { handleList } from "./commands/list";
import { handleRead } from "./commands/read";
import { handleCreate } from "./commands/create";
import { handleUpdate } from "./commands/update";
import { handleDelete } from "./commands/delete";
import { printUsage, printCommandUsage } from "./help";

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));

  // Global help
  if (options.h || options.help || command === "help") {
    if (command && command !== "help") {
      printCommandUsage(command);
    } else if (typeof options.help === "string" && options.help) {
      printCommandUsage(options.help);
    } else if (typeof options.h === "string" && options.h) {
      printCommandUsage(options.h);
    } else {
      printUsage();
    }
    process.exit(0);
  }

  if (!command) {
    printUsage();
    process.exit(1);
  }

  // Subcommands dispatcher placeholders
  switch (command) {
    case "list":
      await handleList(options);
      break;
    case "read":
      await handleRead(options);
      break;
    case "create":
      await handleCreate(options);
      break;
    case "update":
      await handleUpdate(options);
      break;
    case "delete":
      await handleDelete(options);
      break;
    default:
      console.error(`Error: Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message || err}`);
  process.exit(1);
});
