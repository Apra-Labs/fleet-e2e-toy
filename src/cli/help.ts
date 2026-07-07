/**
 * Help/usage text for the CLI: a top-level usage summary listing all
 * subcommands, plus per-command usage strings describing flags and
 * required arguments.
 */

export const COMMAND_NAMES = ["list", "read", "create", "update", "delete"] as const;

export type CommandName = (typeof COMMAND_NAMES)[number];

export const topLevelUsage = [
  "Usage: fleet-e2e-toy <command> [flags]",
  "",
  "Commands:",
  "  list      List notes",
  "  read      Read a note",
  "  create    Create a note",
  "  update    Update a note",
  "  delete    Delete a note",
  "",
  "Flags:",
  "  --help, -h    Show help",
  "",
  "Run 'fleet-e2e-toy <command> --help' for command-specific usage.",
].join("\n");

const commandUsage: Record<CommandName, string> = {
  list: [
    "Usage: fleet-e2e-toy list [flags]",
    "",
    "List notes.",
    "",
    "Flags:",
    "  --tag <tag>    Filter notes by tag",
    "  --q <query>    Search notes by title/content",
    "  --help, -h     Show this help message",
  ].join("\n"),

  read: [
    "Usage: fleet-e2e-toy read --id <id>",
    "",
    "Read a single note by ID.",
    "",
    "Flags:",
    "  --id <id>      ID of the note to read (required)",
    "  --help, -h     Show this help message",
  ].join("\n"),

  create: [
    "Usage: fleet-e2e-toy create --title <title> --content <content> [--tags <tag1,tag2>]",
    "",
    "Create a new note.",
    "",
    "Flags:",
    "  --title <title>      Title of the note (required)",
    "  --content <content>  Content of the note (required)",
    "  --tags <tags>        Comma-separated list of tags",
    "  --help, -h           Show this help message",
  ].join("\n"),

  update: [
    "Usage: fleet-e2e-toy update --id <id> [--title <title>] [--content <content>] [--tags <tag1,tag2>]",
    "",
    "Update an existing note.",
    "",
    "Flags:",
    "  --id <id>            ID of the note to update (required)",
    "  --title <title>      New title",
    "  --content <content>  New content",
    "  --tags <tags>        Comma-separated list of tags",
    "  --help, -h           Show this help message",
  ].join("\n"),

  delete: [
    "Usage: fleet-e2e-toy delete --id <id>",
    "",
    "Delete a note by ID.",
    "",
    "Flags:",
    "  --id <id>      ID of the note to delete (required)",
    "  --help, -h     Show this help message",
  ].join("\n"),
};

export function isCommandName(name: string): name is CommandName {
  return (COMMAND_NAMES as readonly string[]).includes(name);
}

export function getCommandUsage(name: CommandName): string {
  return commandUsage[name];
}

export function printTopLevelUsage(): void {
  process.stdout.write(topLevelUsage + "\n");
}

export function printCommandUsage(name: CommandName): void {
  process.stdout.write(getCommandUsage(name) + "\n");
}
