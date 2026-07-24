export const SUBCOMMAND_NAMES = ["list", "read", "create", "update", "delete"] as const;
export type SubcommandName = (typeof SUBCOMMAND_NAMES)[number];

const SUBCOMMAND_USAGE: Record<SubcommandName, string> = {
  list: [
    "Usage: noteapi-cli list [--tag <tag>] [--q <query>]",
    "",
    "List notes, optionally filtered by tag and/or a text search query.",
    "",
    "Options:",
    "  --tag <tag>   Only include notes with this tag",
    "  --q <query>   Only include notes whose title/content match this query",
    "  --help, -h    Show this help message",
  ].join("\n"),
  read: [
    "Usage: noteapi-cli read --id <id>",
    "",
    "Print a single note by id.",
    "",
    "Options:",
    "  --id <id>     Id of the note to read (required)",
    "  --help, -h    Show this help message",
  ].join("\n"),
  create: [
    "Usage: noteapi-cli create --title <title> --content <content>",
    "",
    "Create a new note.",
    "",
    "Options:",
    "  --title <title>      Title of the note (required)",
    "  --content <content>  Content of the note (required)",
    "  --help, -h            Show this help message",
  ].join("\n"),
  update: [
    "Usage: noteapi-cli update --id <id> [--title <title>] [--content <content>]",
    "",
    "Update an existing note. At least one of --title/--content is required.",
    "",
    "Options:",
    "  --id <id>             Id of the note to update (required)",
    "  --title <title>       New title",
    "  --content <content>   New content",
    "  --help, -h            Show this help message",
  ].join("\n"),
  delete: [
    "Usage: noteapi-cli delete --id <id>",
    "",
    "Delete a note by id.",
    "",
    "Options:",
    "  --id <id>     Id of the note to delete (required)",
    "  --help, -h    Show this help message",
  ].join("\n"),
};

export function printGlobalUsage(): void {
  const names = SUBCOMMAND_NAMES.join("|");
  console.log(
    [
      `Usage: noteapi-cli <${names}> [args]`,
      "",
      "Commands:",
      "  list      List notes, optionally filtered by --tag/--q",
      "  read      Print a single note by --id",
      "  create    Create a note from --title/--content",
      "  update    Update a note's --title/--content by --id",
      "  delete    Delete a note by --id",
      "",
      "Options:",
      "  --help, -h    Show this help message",
      "",
      "Run 'noteapi-cli <command> --help' for details on a specific command.",
    ].join("\n")
  );
}

export function printSubcommandUsage(name: SubcommandName): void {
  console.log(SUBCOMMAND_USAGE[name]);
}

export function isHelpFlag(arg: string | undefined): boolean {
  return arg === "--help" || arg === "-h";
}

export function hasHelpFlag(args: string[]): boolean {
  return args.some((arg) => isHelpFlag(arg));
}
