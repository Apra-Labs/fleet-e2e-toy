import { TOOL_NAME } from "./version";

/** Per-subcommand help text. */
const subcommandHelp: Record<string, string> = {
  list: `Usage: ${TOOL_NAME} list [options]

List all notes.

Options:
  --tag <tag>    Filter notes by tag
  --q <query>    Search notes by query string
  --json         Output results as JSON
  --help, -h     Show this help message
`,
  read: `Usage: ${TOOL_NAME} read [options]

Read a single note by ID.

Options:
  --id <id>      Note ID (required)
  --json         Output result as JSON
  --help, -h     Show this help message
`,
  create: `Usage: ${TOOL_NAME} create [options]

Create a new note.

Options:
  --title <title>      Note title (required)
  --content <content>  Note content (required)
  --tags <tag,...>     Comma-separated list of tags
  --json               Output created note as JSON
  --help, -h           Show this help message
`,
  update: `Usage: ${TOOL_NAME} update [options]

Update an existing note.

Options:
  --id <id>            Note ID (required)
  --title <title>      New title
  --content <content>  New content
  --tags <tag,...>     New comma-separated list of tags
  --json               Output updated note as JSON
  --help, -h           Show this help message
`,
  delete: `Usage: ${TOOL_NAME} delete [options]

Delete a note by ID.

Options:
  --id <id>      Note ID (required)
  --help, -h     Show this help message
`,
};

/** Global top-level help text. */
const globalHelp = `Usage: ${TOOL_NAME} <command> [options]

Commands:
  list      List all notes
  read      Read a note by ID
  create    Create a new note
  update    Update an existing note
  delete    Delete a note

Global options:
  --version, -v  Print version and exit
  --help, -h     Show this help message
  --json         Output as JSON where supported

Run '${TOOL_NAME} <command> --help' for command-specific help.
`;

/**
 * Print help to stdout. If a known subcommand is supplied, prints that
 * command's help; otherwise prints the global top-level usage.
 */
export function printHelp(command?: string): void {
  if (command !== undefined && subcommandHelp[command] !== undefined) {
    process.stdout.write(subcommandHelp[command]);
  } else {
    process.stdout.write(globalHelp);
  }
}
