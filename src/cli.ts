// CLI interface for NoteAPI
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { v4 as uuidv4 } from "uuid";
import { noteStore } from "./models/note";
import { validateCreateInput, validateUpdateInput } from "./utils/validation";

export interface CliIO {
  out?: (s: string) => void;
  err?: (s: string) => void;
}

export interface ParsedArgs {
  command?: string;
  positional: string[];
  flags: Record<string, string | boolean>;
  helpRequested: boolean;
  versionRequested: boolean;
}

export class CliError extends Error {
  code = 1;
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}

// Known flags per command (used for validation)
const KNOWN_FLAGS: Record<string, Set<string>> = {
  create: new Set(["title", "content", "tags", "help"]),
  list: new Set(["tag", "search", "help"]),
  get: new Set(["help"]),
  update: new Set(["title", "content", "tags", "help"]),
  delete: new Set(["help"]),
  "": new Set(["help", "version"]), // root (no command)
};

export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: undefined,
    positional: [],
    flags: {},
    helpRequested: false,
    versionRequested: false,
  };

  let i = 0;

  // First non-flag token is the command
  while (i < argv.length) {
    const token = argv[i];
    if (token === "-h" || token === "--help") {
      result.helpRequested = true;
      result.flags["help"] = true;
      i++;
    } else if (token === "-V" || token === "--version") {
      result.versionRequested = true;
      result.flags["version"] = true;
      i++;
    } else if (token.startsWith("--")) {
      // Flag before command — check if it has = in it
      if (token.includes("=")) {
        const eqIdx = token.indexOf("=");
        const flagName = token.slice(2, eqIdx);
        const flagValue = token.slice(eqIdx + 1);
        // Validate against root flags
        const knownRoot = KNOWN_FLAGS[""];
        if (!knownRoot.has(flagName)) {
          throw new CliError(`Error: Unknown flag: --${flagName}`);
        }
        result.flags[flagName] = flagValue;
        i++;
      } else {
        const flagName = token.slice(2);
        const knownRoot = KNOWN_FLAGS[""];
        if (!knownRoot.has(flagName)) {
          throw new CliError(`Error: Unknown flag: --${flagName}`);
        }
        // Check next token for value
        if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
          result.flags[flagName] = argv[i + 1];
          i += 2;
        } else {
          throw new CliError(`Error: Missing value for flag: --${flagName}`);
        }
      }
    } else if (token.startsWith("-")) {
      throw new CliError(`Error: Unknown flag: ${token}`);
    } else {
      // This is the command
      result.command = token;
      i++;
      break;
    }
  }

  // Parse remaining tokens after command
  const cmd = result.command ?? "";
  const knownForCmd = KNOWN_FLAGS[cmd] ?? new Set<string>();

  while (i < argv.length) {
    const token = argv[i];
    if (token === "-h" || token === "--help") {
      result.helpRequested = true;
      result.flags["help"] = true;
      i++;
    } else if (token === "-V" || token === "--version") {
      result.versionRequested = true;
      result.flags["version"] = true;
      i++;
    } else if (token.startsWith("--")) {
      if (token.includes("=")) {
        const eqIdx = token.indexOf("=");
        const flagName = token.slice(2, eqIdx);
        const flagValue = token.slice(eqIdx + 1);
        if (!knownForCmd.has(flagName)) {
          throw new CliError(`Error: Unknown flag: --${flagName}`);
        }
        result.flags[flagName] = flagValue;
        i++;
      } else {
        const flagName = token.slice(2);
        if (!knownForCmd.has(flagName)) {
          throw new CliError(`Error: Unknown flag: --${flagName}`);
        }
        if (i + 1 >= argv.length || argv[i + 1].startsWith("-")) {
          throw new CliError(`Error: Missing value for flag: --${flagName}`);
        }
        result.flags[flagName] = argv[i + 1];
        i += 2;
      }
    } else if (token.startsWith("-")) {
      throw new CliError(`Error: Unknown flag: ${token}`);
    } else {
      // Positional arg
      result.positional.push(token);
      i++;
    }
  }

  return result;
}

export async function run(argv: string[], io?: CliIO): Promise<number> {
  const out = io?.out ?? ((s: string) => process.stdout.write(s));
  const err = io?.err ?? ((s: string) => process.stderr.write(s));

  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(argv);
  } catch (e) {
    if (e instanceof CliError) {
      err(e.message + "\n");
      return e.code;
    }
    throw e;
  }

  // Handle --help early (before command dispatch)
  if (parsed.helpRequested) {
    if (parsed.command) {
      // Subcommand help
      const helpTexts: Record<string, string> = {
        create: `Usage: note create [options]

Flags:
  --title <title> (required)
  --content <content> (required)
  --tags <a,b,c> (optional)
`,
        list: `Usage: note list [options]

Flags:
  --tag <tag> (optional)
  --search <query> (optional)
`,
        get: `Usage: note get <id>

Arguments:
  <id> (required positional)
`,
        update: `Usage: note update <id> [options]

Arguments:
  <id> (required positional)

Flags:
  --title <title> (optional)
  --content <content> (optional)
  --tags <a,b,c> (optional)
`,
        delete: `Usage: note delete <id>

Arguments:
  <id> (required positional)
`,
      };
      const helpText = helpTexts[parsed.command];
      if (helpText) {
        out(helpText);
        return 0;
      }
    }
    // Root help (no command OR unknown command)
    const rootHelp = `Usage: note <command> [options]

Commands:
  create   Create a new note
  list     List notes (optionally filter by tag or search)
  get      Get a single note by ID
  update   Update fields of an existing note
  delete   Delete a note by ID

Global flags:
  -h, --help     Show help for a command
  -V, --version  Print version and exit
`;
    out(rootHelp);
    return 0;
  }

  // Handle --version early (before command dispatch)
  if (parsed.versionRequested) {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8")) as { version: string };
    out(`noteapi/${pkg.version}\n`);
    return 0;
  }

  // Dispatch on command
  switch (parsed.command) {
    case "create": {
      const title = parsed.flags["title"] as string | undefined;
      const content = parsed.flags["content"] as string | undefined;
      const tagsRaw = parsed.flags["tags"] as string | undefined;
      const tags = tagsRaw
        ? tagsRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // CLI-side guard: --content flag missing entirely
      if (!("content" in parsed.flags)) {
        err("Error: content: content is required\n");
        return 1;
      }

      // CLI-side guard: --content flag present but empty string
      if (content === "") {
        err("Error: content: must not be empty\n");
        return 1;
      }

      const input = {
        title: title ?? "",
        content: content ?? "",
        tags,
      };

      const result = validateCreateInput(input);
      if (!result.valid) {
        for (const e of result.errors) {
          err(`Error: ${e.field}: ${e.message}\n`);
        }
        return 1;
      }

      const now = new Date().toISOString();
      const note = {
        id: uuidv4(),
        title: result.data.title,
        content: result.data.content,
        tags: result.data.tags,
        createdAt: now,
        updatedAt: now,
      };
      noteStore.create(note);
      out(JSON.stringify(note, null, 2) + "\n");
      return 0;
    }

    case "list": {
      let notes = noteStore.getAll();
      const tag = parsed.flags["tag"] as string | undefined;
      const search = parsed.flags["search"] as string | undefined;

      if (tag) {
        notes = notes.filter((n) => n.tags.includes(tag));
      }
      if (search) {
        const q = search.toLowerCase();
        notes = notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        );
      }

      out(JSON.stringify(notes, null, 2) + "\n");
      return 0;
    }

    case "get": {
      const id = parsed.positional[0];
      if (!id) {
        err("Error: Missing required argument: id\n");
        return 1;
      }
      const note = noteStore.getById(id);
      if (!note) {
        err(`Error: Note not found: ${id}\n`);
        return 1;
      }
      out(JSON.stringify(note, null, 2) + "\n");
      return 0;
    }

    case "update": {
      const id = parsed.positional[0];
      if (!id) {
        err("Error: Missing required argument: id\n");
        return 1;
      }

      const payload: Record<string, unknown> = {};
      if ("title" in parsed.flags) {
        payload.title = parsed.flags["title"];
      }
      if ("content" in parsed.flags) {
        payload.content = parsed.flags["content"];
      }
      if ("tags" in parsed.flags) {
        const tagsRaw = parsed.flags["tags"] as string;
        payload.tags = tagsRaw
          ? tagsRaw.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
      }

      const result = validateUpdateInput(payload);
      if (!result.valid) {
        for (const e of result.errors) {
          err(`Error: ${e.field}: ${e.message}\n`);
        }
        return 1;
      }

      const updated = noteStore.update(id, result.data);
      if (!updated) {
        err(`Error: Note not found: ${id}\n`);
        return 1;
      }
      out(JSON.stringify(updated, null, 2) + "\n");
      return 0;
    }

    case "delete": {
      const id = parsed.positional[0];
      if (!id) {
        err("Error: Missing required argument: id\n");
        return 1;
      }
      const deleted = noteStore.delete(id);
      if (!deleted) {
        err(`Error: Note not found: ${id}\n`);
        return 1;
      }
      out(JSON.stringify({ deleted: true }) + "\n");
      return 0;
    }

    default:
      if (!parsed.command) {
        // No command — show root help
        const rootHelp = `Usage: note <command> [options]

Commands:
  create   Create a new note
  list     List notes (optionally filter by tag or search)
  get      Get a single note by ID
  update   Update fields of an existing note
  delete   Delete a note by ID

Global flags:
  -h, --help     Show help for a command
  -V, --version  Print version and exit
`;
        out(rootHelp);
        return 0;
      }
      err(`Error: Unknown command: ${parsed.command}\n`);
      return 1;
  }
}

if (require.main === module) {
  run(process.argv.slice(2)).then((code) => process.exit(code));
}
