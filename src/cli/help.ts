export const GLOBAL_HELP = `Usage: noteapi <command> [options]

Commands:
  list      List notes (optional: --tag <tag>, --q <search>)
  read      Read a note by id (required: --id <id>)
  create    Create a note (required: --title, --content; optional: --tag)
  update    Update a note (required: --id; optional: --title, --content, --tag)
  delete    Delete a note (required: --id)

Global flags:
  --help, -h    Show this help message and exit
  --version, -v Show the CLI version and exit

Run 'noteapi <command> --help' for command-specific options.`;

const COMMAND_HELP: Record<string, string> = {
  list: `Usage: noteapi list [options]

List all notes. Prints each note as '<id> <title>', one per line.

Options:
  --tag <tag>    Filter notes by tag
  --q <search>   Search notes by keyword
  --help, -h     Show this help message and exit`,

  read: `Usage: noteapi read --id <id>

Read and display a note by its id.

Required:
  --id <id>      The id of the note to read

Options:
  --help, -h     Show this help message and exit`,

  create: `Usage: noteapi create --title <title> --content <content> [--tag <tags>]

Create a new note. Prints the created note's id to stdout.

Required:
  --title <title>      Title of the note (non-empty)
  --content <content>  Content of the note

Optional:
  --tag <tags>         Comma-separated tags to assign to the note

Options:
  --help, -h           Show this help message and exit`,

  update: `Usage: noteapi update --id <id> [--title <title>] [--content <content>] [--tag <tags>]

Update an existing note. Prints the updated note to stdout.

Required:
  --id <id>            The id of the note to update

Optional:
  --title <title>      New title for the note (non-empty)
  --content <content>  New content for the note
  --tag <tags>         Comma-separated tags to replace the note's tags

Options:
  --help, -h           Show this help message and exit`,

  delete: `Usage: noteapi delete --id <id>

Delete a note by its id.

Required:
  --id <id>      The id of the note to delete

Options:
  --help, -h     Show this help message and exit`,
};

export function printGlobalHelp(): void {
  process.stdout.write(`${GLOBAL_HELP}\n`);
}

export function printCommandHelp(command: string): void {
  const help = COMMAND_HELP[command];
  if (help) {
    process.stdout.write(`${help}\n`);
  } else {
    process.stdout.write(`${GLOBAL_HELP}\n`);
  }
}
