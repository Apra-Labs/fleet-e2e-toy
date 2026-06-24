#!/usr/bin/env ts-node
import { parseArgs } from "./args";
import { handleList } from "./commands/list";
import { handleRead } from "./commands/read";

function printUsage() {
  console.log("Usage: fleet-e2e-toy <command> [options]");
  console.log("");
  console.log("Commands:");
  console.log("  list              List all notes");
  console.log("  read              Read a note details");
  console.log("  create            Create a new note");
  console.log("  update            Update an existing note");
  console.log("  delete            Delete a note");
  console.log("");
  console.log("Options:");
  console.log("  -h, --help        Show help details");
}

function printCommandUsage(command: string) {
  switch (command) {
    case "list":
      console.log("Usage: fleet-e2e-toy list [options]");
      console.log("");
      console.log("Options:");
      console.log("  --tag <tag>       Filter notes by tag");
      console.log("  --q <query>       Search notes by query string");
      break;
    case "read":
      console.log("Usage: fleet-e2e-toy read --id <id>");
      break;
    case "create":
      console.log("Usage: fleet-e2e-toy create --title <title> --content <content> [--tags <tags>]");
      break;
    case "update":
      console.log("Usage: fleet-e2e-toy update --id <id> [options]");
      console.log("");
      console.log("Options:");
      console.log("  --title <title>   Update title");
      console.log("  --content <desc>  Update content");
      console.log("  --tags <tags>     Update tags");
      break;
    case "delete":
      console.log("Usage: fleet-e2e-toy delete --id <id>");
      break;
    default:
      printUsage();
  }
}

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
      console.log("create command called with options:", options);
      break;
    case "update":
      console.log("update command called with options:", options);
      break;
    case "delete":
      console.log("delete command called with options:", options);
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
