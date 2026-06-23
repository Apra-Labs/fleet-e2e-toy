export const GLOBAL_USAGE = `fleet-e2e-toy — Notes CLI

Usage: fleet-e2e-toy <command> [options]

Global flags:
  --version, -v   Print version and exit
  --help,    -h   Print this help (or per-command help when after a subcommand)

Commands:
  list      List notes (optionally filtered by tag or search query)
  read      Read a single note by id
  create    Create a new note
  update    Update an existing note
  delete    Delete a note by id
`;

const COMMAND_USAGE: Record<string, string> = {
  list: `Usage: fleet-e2e-toy list [options]

List all notes. Results can be filtered with optional flags.

Options:
  --tag <tag>   Filter notes by tag
  --q <query>   Filter notes by search query
  --help, -h    Show this help
`,
  read: `Usage: fleet-e2e-toy read --id <id>

Read a single note by its id.

Required:
  --id <id>   Id of the note to read

Options:
  --help, -h  Show this help
`,
  create: `Usage: fleet-e2e-toy create --title <title> --content <content> [--tag <tag>...]

Create a new note.

Required:
  --title <title>     Title of the note
  --content <content> Body of the note

Options:
  --tag <tag>   Add a tag (can be repeated)
  --help, -h    Show this help
`,
  update: `Usage: fleet-e2e-toy update --id <id> [--title <title>] [--content <content>] [--tag <tag>...]

Update an existing note.

Required:
  --id <id>     Id of the note to update

Options:
  --title <title>     New title
  --content <content> New content
  --tag <tag>         Replace tags (can be repeated)
  --help, -h          Show this help
`,
  delete: `Usage: fleet-e2e-toy delete --id <id>

Delete a note by its id.

Required:
  --id <id>   Id of the note to delete

Options:
  --help, -h  Show this help
`,
};

/**
 * Print help for a specific subcommand, or global help when no command is given.
 */
export function printHelp(command?: string): void {
  if (command && COMMAND_USAGE[command]) {
    process.stdout.write(COMMAND_USAGE[command]);
  } else {
    process.stdout.write(GLOBAL_USAGE);
  }
}
