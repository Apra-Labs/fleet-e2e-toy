const GLOBAL_HELP = `
Usage: cli <command> [options]

Commands:
  list      List all notes (optionally filter by --tag or --q)
  read      Get a single note by --id
  create    Create a new note (requires --title and --content)
  update    Update an existing note (requires --id, at least one of --title/--content)
  delete    Delete a note by --id

Global flags:
  --help, -h      Show this help message
  --version, -v   Print version and exit
`.trim();

const COMMAND_HELP: Record<string, string> = {
  list: `
Usage: cli list [options]

Options:
  --tag <tag>    Filter notes by tag
  --q <query>    Filter notes by search query
  --help, -h     Show this help message
`.trim(),

  read: `
Usage: cli read --id <id>

Options:
  --id <id>      (required) ID of the note to read
  --help, -h     Show this help message
`.trim(),

  create: `
Usage: cli create --title <title> --content <content> [--tag <tag>]

Options:
  --title <title>       (required) Title of the note
  --content <content>   (required) Content of the note
  --tag <tag>           Tag to add (comma-separated for multiple)
  --help, -h            Show this help message
`.trim(),

  update: `
Usage: cli update --id <id> [--title <title>] [--content <content>]

Options:
  --id <id>             (required) ID of the note to update
  --title <title>       New title for the note
  --content <content>   New content for the note
  --help, -h            Show this help message
`.trim(),

  delete: `
Usage: cli delete --id <id>

Options:
  --id <id>      (required) ID of the note to delete
  --help, -h     Show this help message
`.trim(),
};

export function printGlobalHelp(): void {
  process.stdout.write(GLOBAL_HELP + "\n");
}

export function printCommandHelp(command: string): void {
  const help = COMMAND_HELP[command];
  if (help) {
    process.stdout.write(help + "\n");
  } else {
    process.stdout.write(GLOBAL_HELP + "\n");
  }
}
