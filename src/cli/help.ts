/**
 * Help text for the CLI tool.
 */

const COMMANDS = ["list", "read", "create", "update", "delete"] as const;
type Command = (typeof COMMANDS)[number];

const COMMAND_HELP: Record<Command, string> = {
  list: `Usage: tool list [options]

List all notes.

Options:
  --tag <tag>    Filter notes by tag
  --q <query>    Search notes by text query
  --help, -h     Show this help message`,

  read: `Usage: tool read --id <id> [options]

Read a single note by ID.

Options:
  --id <id>      Note ID to retrieve (required)
  --help, -h     Show this help message`,

  create: `Usage: tool create --title <title> --content <content> [options]

Create a new note.

Options:
  --title <title>      Note title (required)
  --content <content>  Note content (required)
  --tags <tag,...>     Comma-separated list of tags
  --help, -h           Show this help message`,

  update: `Usage: tool update --id <id> [options]

Update an existing note by ID.

Options:
  --id <id>            Note ID to update (required)
  --title <title>      New title
  --content <content>  New content
  --tags <tag,...>     New comma-separated list of tags
  --help, -h           Show this help message`,

  delete: `Usage: tool delete --id <id> [options]

Delete a note by ID.

Options:
  --id <id>      Note ID to delete (required)
  --help, -h     Show this help message`,
};

/**
 * Return the global help string listing all subcommands and global flags.
 */
export function globalHelp(): string {
  return `Usage: tool <command> [options]

A CLI tool for managing notes via the NoteAPI.

Commands:
  list      List all notes (supports filtering by tag or search query)
  read      Read a single note by ID
  create    Create a new note
  update    Update an existing note
  delete    Delete a note by ID

Global flags:
  --version, -v   Print the version and exit
  --help, -h      Show this help message

Run 'tool <command> --help' for per-command usage.`;
}

/**
 * Return the help string for a specific subcommand.
 * Falls back to global help if the command is not recognised.
 */
export function commandHelp(command: string): string {
  if (COMMANDS.includes(command as Command)) {
    return COMMAND_HELP[command as Command];
  }
  return globalHelp();
}
