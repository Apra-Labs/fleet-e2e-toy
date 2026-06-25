const GLOBAL_HELP = `Usage: noteapi-cli [options] [command]

Options:
  -v, --version  Show version number
  -h, --help     Show help

Commands:
  list           List all notes
  read           Read a note by ID
  create         Create a new note
  update         Update an existing note
  delete         Delete a note`;

const SUBCOMMAND_HELP: Record<string, string> = {
  list: `Usage: noteapi-cli list [options]

List all notes.

Options:
  -t, --tag <tag>      Filter notes by tag
  -q, --query <query>  Search notes by query string
  -h, --help           Show help for this command`,

  read: `Usage: noteapi-cli read <id> [options]

Read a note by ID.

Options:
  -h, --help  Show help for this command`,

  create: `Usage: noteapi-cli create <title> [content] [options]

Create a new note.

Options:
  --tag <tags...>  Tags for the note
  -h, --help       Show help for this command`,

  update: `Usage: noteapi-cli update <id> [options]

Update an existing note.

Options:
  --title <title>      New title for the note
  --content <content>  New content for the note
  --tag <tags...>      New tags for the note
  -h, --help           Show help for this command`,

  delete: `Usage: noteapi-cli delete <id> [options]

Delete a note by ID.

Options:
  -h, --help  Show help for this command`
};

export function main(args: string[]): void {
  // 1. Version check
  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }

  // 2. Argument validation (empty/whitespace arguments check)
  for (const arg of args) {
    if (arg.trim() === "") {
      console.error("Error: Argument cannot be empty or whitespace-only.");
      process.exit(1);
    }
  }

  // 3. Help check
  if (args.includes("--help") || args.includes("-h")) {
    const subcommands = ["list", "read", "create", "update", "delete"];
    const foundSubcommand = args.find((arg) => subcommands.includes(arg));

    if (foundSubcommand && foundSubcommand in SUBCOMMAND_HELP) {
      console.log(SUBCOMMAND_HELP[foundSubcommand]);
    } else {
      console.log(GLOBAL_HELP);
    }
    process.exit(0);
  }
}
