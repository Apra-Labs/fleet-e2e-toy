const TOOL_NAME = "noteapi-cli";
const VERSION = "1.0.0";

export const SUBCOMMANDS = ["list", "read", "create", "update", "delete"] as const;
export type Subcommand = (typeof SUBCOMMANDS)[number];

export const TOP_LEVEL_USAGE = `Usage: ${TOOL_NAME} <command> [options]

A command-line client for the NoteAPI REST service.

Commands:
  list      List notes, optionally filtered by tag or search query
  read      Read a single note by ID
  create    Create a new note
  update    Update an existing note
  delete    Delete a note by ID

Global options:
  -h, --help    Show help for the tool or a subcommand

Run '${TOOL_NAME} <command> --help' for details on a specific command.`;

const SUBCOMMAND_USAGE: Record<Subcommand, string> = {
  list: `Usage: ${TOOL_NAME} list [options]

List notes, optionally filtered by tag or search query.

Options:
  --tag <tag>    Only show notes containing this tag (optional)
  --q <query>    Only show notes whose title or content match this query (optional)
  -h, --help     Show this help message`,

  read: `Usage: ${TOOL_NAME} read --id <id>

Read a single note by ID.

Options:
  --id <id>     ID of the note to read (required)
  -h, --help    Show this help message`,

  create: `Usage: ${TOOL_NAME} create --title <title> --content <content> [--tag <tag>...]

Create a new note.

Options:
  --title <title>      Title of the note (required)
  --content <content>  Content of the note (required)
  --tag <tag>          Tag to attach to the note (optional, repeatable)
  -h, --help           Show this help message`,

  update: `Usage: ${TOOL_NAME} update --id <id> [--title <title>] [--content <content>] [--tag <tag>...]

Update an existing note.

Options:
  --id <id>            ID of the note to update (required)
  --title <title>      New title for the note (optional)
  --content <content>  New content for the note (optional)
  --tag <tag>          New tag for the note (optional, repeatable)
  -h, --help           Show this help message`,

  delete: `Usage: ${TOOL_NAME} delete --id <id>

Delete a note by ID.

Options:
  --id <id>     ID of the note to delete (required)
  -h, --help    Show this help message`,
};

export function isSubcommand(value: string | undefined): value is Subcommand {
  return typeof value === "string" && (SUBCOMMANDS as readonly string[]).includes(value);
}

export function subcommandUsage(command: Subcommand): string {
  return SUBCOMMAND_USAGE[command];
}

export function getVersionString(): string {
  return `fleet-e2e-toy v${VERSION}`;
}
