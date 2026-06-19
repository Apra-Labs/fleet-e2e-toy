import { parseArgs } from "./parser";

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
        console.log("No subcommand provided");
      } else {
        console.log(`Unknown subcommand: ${args.subcommand}`);
      }
  }
}

main();
