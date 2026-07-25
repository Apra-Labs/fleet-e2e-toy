/** Names of every supported subcommand, used to validate/list help topics. */
export const SUBCOMMAND_NAMES = ["list", "read", "create", "update", "delete"] as const;
export type SubcommandName = (typeof SUBCOMMAND_NAMES)[number];

/** Global (top-level) usage text: lists all subcommands and global flags. */
export function globalHelpText(): string {
  const lines = [
    "Usage: noteapi <command> [options]",
    "",
    "Commands:",
    "  list                 List notes (optional --tag, --q filters)",
    "  read                 Show a single note (--id)",
    "  create               Create a note (--title, --content, --tag...)",
    "  update                Update a note (--id, --title, --content, --tag...)",
    "  delete               Delete a note (--id)",
    "",
    "Options:",
    "  --help, -h           Show this help text (or 'noteapi <command> --help')",
    "  --version, -v        Show the CLI version",
    "",
    "Environment:",
    "  NOTEAPI_URL          Base URL of the API (default http://localhost:3000)",
  ];
  return lines.join("\n");
}

/** Per-subcommand usage text keyed by subcommand name. */
const subcommandHelp: Record<SubcommandName, string> = {
  list: [
    "Usage: noteapi list [--tag <tag>] [--q <query>]",
    "",
    "List notes, optionally filtered.",
    "",
    "Options:",
    "  --tag <tag>          Only show notes with this tag",
    "  --q <query>          Only show notes matching this search query",
  ].join("\n"),
  read: [
    "Usage: noteapi read --id <id>",
    "",
    "Show a single note by id.",
    "",
    "Options:",
    "  --id <id>            (required) Id of the note to read",
  ].join("\n"),
  create: [
    "Usage: noteapi create --title <title> --content <content> [--tag <tag> ...]",
    "",
    "Create a new note.",
    "",
    "Options:",
    "  --title <title>      (required) Note title",
    "  --content <content>  (required) Note content",
    "  --tag <tag>          Add a tag (repeatable)",
  ].join("\n"),
  update: [
    "Usage: noteapi update --id <id> [--title <title>] [--content <content>] [--tag <tag> ...]",
    "",
    "Update an existing note.",
    "",
    "Options:",
    "  --id <id>            (required) Id of the note to update",
    "  --title <title>      New title",
    "  --content <content>  New content",
    "  --tag <tag>          Replace tags with these (repeatable)",
  ].join("\n"),
  delete: [
    "Usage: noteapi delete --id <id>",
    "",
    "Delete a note by id.",
    "",
    "Options:",
    "  --id <id>            (required) Id of the note to delete",
  ].join("\n"),
};

/** Returns usage text for a specific subcommand, or undefined if unknown. */
export function subcommandHelpText(name: string): string | undefined {
  if ((SUBCOMMAND_NAMES as readonly string[]).includes(name)) {
    return subcommandHelp[name as SubcommandName];
  }
  return undefined;
}
