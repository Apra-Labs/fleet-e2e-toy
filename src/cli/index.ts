import { parseArgs } from "./parser";
import { printHelp } from "./help";
import { getVersion } from "./version";

function listHandler(): void {
  console.log("List handler called");
}

function readHandler(): void {
  console.log("Read handler called");
}

function createHandler(): void {
  console.log("Create handler called");
}

function updateHandler(): void {
  console.log("Update handler called");
}

function deleteHandler(): void {
  console.log("Delete handler called");
}

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
      listHandler();
      break;
    case "read":
      readHandler();
      break;
    case "create":
      createHandler();
      break;
    case "update":
      updateHandler();
      break;
    case "delete":
      deleteHandler();
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
