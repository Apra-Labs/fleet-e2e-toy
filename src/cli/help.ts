const SUBCOMMANDS = ["list", "read", "create", "update", "delete"];

const topLevelUsage = `Usage: noteapi <subcommand> [flags]

Subcommands:
  list     List all notes (supports --tag and --q filters)
  read     Read a single note by ID (--id required)
  create   Create a new note (--title and --content required)
  update   Update an existing note (--id required; --title, --content optional)
  delete   Delete a note by ID (--id required)

Global flags:
  --help, -h      Show help
  --version, -v   Show version

Run 'noteapi <subcommand> --help' for subcommand-specific usage.
`;

const subcommandUsage: Record<string, string> = {
  list: `Usage: noteapi list [flags]

List all notes, with optional filters.

Flags:
  --tag <tag>   Filter notes by tag
  --q <query>   Filter notes by search query (title/content)
  --help, -h    Show this help message
`,
  read: `Usage: noteapi read --id <id>

Read a single note by its ID.

Flags:
  --id <id>   (required) ID of the note to read
  --help, -h  Show this help message
`,
  create: `Usage: noteapi create --title <title> --content <content>

Create a new note.

Flags:
  --title <title>       (required) Title of the note
  --content <content>   (required) Content of the note
  --help, -h            Show this help message
`,
  update: `Usage: noteapi update --id <id> [--title <title>] [--content <content>]

Update an existing note by its ID.

Flags:
  --id <id>             (required) ID of the note to update
  --title <title>       (optional) New title for the note
  --content <content>   (optional) New content for the note
  --help, -h            Show this help message
`,
  delete: `Usage: noteapi delete --id <id>

Delete a note by its ID.

Flags:
  --id <id>   (required) ID of the note to delete
  --help, -h  Show this help message
`,
};

export function printHelp(command?: string): void {
  if (command && SUBCOMMANDS.includes(command)) {
    process.stdout.write(subcommandUsage[command]);
  } else {
    process.stdout.write(topLevelUsage);
  }
}
