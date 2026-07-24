// Help text for the global CLI usage and each subcommand's usage. Kept
// separate from commands.ts so the entrypoint and each command handler can
// share a single source of truth for --help/-h output.

export const GLOBAL_USAGE = `Usage: noteapi <command> [options]

Commands:
  list     List notes (optional --tag, --q filters)
  read     Read a note (--id required)
  create   Create a note (--title, --content required)
  update   Update a note (--id required; --title, --content optional)
  delete   Delete a note (--id required)

Environment:
  NOTEAPI_URL  Base URL of the NoteAPI server (default http://localhost:3000)

Run 'noteapi <command> --help' for command-specific options.`;

export const COMMAND_USAGE: Record<string, string> = {
  list: `Usage: noteapi list [options]

List notes (optional --tag, --q filters)

Options:
  --tag <tag>   Filter notes by tag
  --q <query>   Filter notes by search query
  --help, -h    Show this help message`,

  read: `Usage: noteapi read --id <id>

Read a single note by id

Options:
  --id <id>     Note id (required)
  --help, -h    Show this help message`,

  create: `Usage: noteapi create --title <title> --content <content>

Create a new note

Options:
  --title <title>      Note title (required)
  --content <content>  Note content (required)
  --tag <tag>          Tag to attach (repeatable)
  --help, -h           Show this help message`,

  update: `Usage: noteapi update --id <id> [--title <title>] [--content <content>]

Update an existing note

Options:
  --id <id>             Note id (required)
  --title <title>       New title (optional)
  --content <content>   New content (optional)
  --help, -h            Show this help message`,

  delete: `Usage: noteapi delete --id <id>

Delete a note by id

Options:
  --id <id>     Note id (required)
  --help, -h    Show this help message`,
};

// Returns true if argv requests help (--help or -h appears anywhere).
export function wantsHelp(args: string[]): boolean {
  return args.includes("--help") || args.includes("-h");
}

// Looks up the per-subcommand usage text, falling back to the global usage
// if the command name is unknown.
export function commandUsage(name: string): string {
  return COMMAND_USAGE[name] ?? GLOBAL_USAGE;
}
