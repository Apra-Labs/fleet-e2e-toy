export function printUsage(): void {
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

export function printCommandUsage(command: string): void {
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
