// Usage/help text for the CLI and each subcommand.

export const SUBCOMMANDS = ["list", "read", "create", "update", "delete"] as const;
export type Subcommand = (typeof SUBCOMMANDS)[number];

export const GLOBAL_HELP = `noteapi-cli — manage notes via the NoteAPI REST API

Usage: noteapi-cli <subcommand> [args...]

Subcommands:
  list                       List notes (optional --tag, --q filters)
  read     --id <id>         Show a single note
  create   --title <title> --content <content>
                              Create a new note
  update   --id <id> [--title <title>] [--content <content>]
                              Update an existing note
  delete   --id <id>         Delete a note

Global flags:
  --help, -h                  Show this help message
  --version                   Show the CLI version

Run 'noteapi-cli <subcommand> --help' for subcommand-specific usage.
`;

export const SUBCOMMAND_HELP: Record<Subcommand, string> = {
  list: `Usage: noteapi-cli list [--tag <tag>] [--q <query>]

List all notes, optionally filtered by tag and/or a search query.

Flags:
  --tag <tag>     Only show notes with this tag
  --q <query>     Only show notes whose title/content match this query
  --help, -h      Show this help message
`,
  read: `Usage: noteapi-cli read --id <id>

Show the full details of a single note.

Flags:
  --id <id>       Note id (required)
  --help, -h      Show this help message
`,
  create: `Usage: noteapi-cli create --title <title> --content <content>

Create a new note.

Flags:
  --title <title>     Note title (required)
  --content <content> Note content (required)
  --help, -h          Show this help message
`,
  update: `Usage: noteapi-cli update --id <id> [--title <title>] [--content <content>]

Update an existing note. At least one of --title/--content is typically supplied.

Flags:
  --id <id>            Note id (required)
  --title <title>      New title
  --content <content>  New content
  --help, -h           Show this help message
`,
  delete: `Usage: noteapi-cli delete --id <id>

Delete a note.

Flags:
  --id <id>       Note id (required)
  --help, -h      Show this help message
`,
};

export function printGlobalHelp(): void {
  process.stdout.write(GLOBAL_HELP);
}

export function printSubcommandHelp(subcommand: Subcommand): void {
  process.stdout.write(SUBCOMMAND_HELP[subcommand]);
}

export function isHelpFlag(args: string[]): boolean {
  return args.includes("--help") || args.includes("-h");
}
