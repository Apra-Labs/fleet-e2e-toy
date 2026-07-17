import { validateCliArgument } from "./utils/validation";

const GLOBAL_HELP = `Usage: noteapi-cli [options] [command]

Options:
  -v, --version  Show version number
  -h, --help     Show help

Commands:
  list           List all notes
  read           Read a note by ID
  create         Create a new note
  update         Update an existing note
  delete         Delete a note`;

const SUBCOMMAND_HELP: Record<string, string> = {
  list: `Usage: noteapi-cli list [options]

List all notes.

Options:
  -t, --tag <tag>      Filter notes by tag
  -q, --query <query>  Search notes by query string
  -h, --help           Show help for this command`,

  read: `Usage: noteapi-cli read <id> [options]

Read a note by ID.

Options:
  -h, --help  Show help for this command`,

  create: `Usage: noteapi-cli create <title> [content] [options]

Create a new note.

Options:
  --tag <tags...>  Tags for the note
  -h, --help       Show help for this command`,

  update: `Usage: noteapi-cli update <id> [options]

Update an existing note.

Options:
  --title <title>      New title for the note
  --content <content>  New content for the note
  --tag <tags...>      New tags for the note
  -h, --help           Show help for this command`,

  delete: `Usage: noteapi-cli delete <id> [options]

Delete a note by ID.

Options:
  -h, --help  Show help for this command`
};

interface ParsedArgs {
  command?: string;
  id?: string;
  title?: string;
  content?: string;
  tags?: string[];
  hasTags: boolean;
  q?: string;
}

function parseCliArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    hasTags: false
  };
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--id") {
      result.id = args[++i];
    } else if (arg === "--title") {
      result.title = args[++i];
    } else if (arg === "--content") {
      result.content = args[++i];
    } else if (arg === "--tag" || arg === "-t") {
      result.hasTags = true;
      if (!result.tags) result.tags = [];
      const val = args[++i];
      if (val !== undefined) {
        result.tags.push(val);
      }
    } else if (arg === "--q" || arg === "-q" || arg === "--query") {
      result.q = args[++i];
    } else if (arg.startsWith("-")) {
      // Ignore other flags
    } else {
      positionals.push(arg);
    }
  }

  if (positionals.length > 0) {
    result.command = positionals[0];
  }

  // Also support positionals mapping if named are missing
  if (result.command) {
    if (result.command === "read" || result.command === "delete") {
      if (!result.id && positionals.length > 1) {
        result.id = positionals[1];
      }
    } else if (result.command === "create") {
      if (!result.title && positionals.length > 1) {
        result.title = positionals[1];
      }
      if (!result.content && positionals.length > 2) {
        result.content = positionals[2];
      }
    } else if (result.command === "update") {
      if (!result.id && positionals.length > 1) {
        result.id = positionals[1];
      }
    }
  }

  return result;
}

export function main(args: string[]): Promise<void> | void {
  // 1. Version check
  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }

  // 2. Argument validation (empty/whitespace arguments check)
  try {
    for (const arg of args) {
      if (arg.trim() === "") {
        validateCliArgument(arg);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }

  // 3. Help check
  if (args.includes("--help") || args.includes("-h")) {
    const subcommands = ["list", "read", "create", "update", "delete"];
    const foundSubcommand = args.find((arg) => subcommands.includes(arg));

    if (foundSubcommand && foundSubcommand in SUBCOMMAND_HELP) {
      console.log(SUBCOMMAND_HELP[foundSubcommand]);
    } else {
      console.log(GLOBAL_HELP);
    }
    process.exit(0);
  }

  const parsed = parseCliArgs(args);
  const command = parsed.command;

  if (!command) {
    console.error("Error: Subcommand is required.");
    console.log(GLOBAL_HELP);
    process.exit(1);
  }

  const subcommands = ["list", "read", "create", "update", "delete"];
  if (!subcommands.includes(command)) {
    console.error(`Error: Unknown subcommand: ${command}`);
    console.log(GLOBAL_HELP);
    process.exit(1);
  }

  return runSubcommand(command, parsed);
}

async function runSubcommand(command: string, parsed: ParsedArgs): Promise<void> {
  const port = process.env.PORT || "3000";
  const baseUrl = `http://localhost:${port}`;
  const globalObj = globalThis as unknown as { fetch: typeof fetch };
  const fetchFn = globalObj.fetch;

  try {
    if (command === "list") {
      const queryParams = new URLSearchParams();
      if (parsed.tags && parsed.tags.length > 0) {
        queryParams.append("tag", parsed.tags[0]);
      }
      if (parsed.q) {
        queryParams.append("q", parsed.q);
      }
      const qs = queryParams.toString();
      const url = `${baseUrl}/api/notes` + (qs ? `?${qs}` : "");
      
      const res = await fetchFn(url);
      const data = await res.json();
      if (!res.ok) {
        console.error(JSON.stringify(data, null, 2));
        process.exit(1);
      }
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    }

    if (command === "read") {
      if (!parsed.id) {
        console.error("Error: ID is required.");
        process.exit(1);
      }
      const res = await fetchFn(`${baseUrl}/api/notes/${parsed.id}`);
      const data = await res.json();
      if (!res.ok) {
        console.error(JSON.stringify(data, null, 2));
        process.exit(1);
      }
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    }

    if (command === "create") {
      if (!parsed.title) {
        console.error("Error: Title is required.");
        process.exit(1);
      }
      const body = {
        title: parsed.title,
        content: parsed.content ?? "",
        tags: parsed.tags ?? []
      };
      const res = await fetchFn(`${baseUrl}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(JSON.stringify(data, null, 2));
        process.exit(1);
      }
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    }

    if (command === "update") {
      if (!parsed.id) {
        console.error("Error: ID is required.");
        process.exit(1);
      }
      const body: Record<string, unknown> = {};
      if (parsed.title !== undefined) body.title = parsed.title;
      if (parsed.content !== undefined) body.content = parsed.content;
      if (parsed.hasTags) body.tags = parsed.tags ?? [];

      const res = await fetchFn(`${baseUrl}/api/notes/${parsed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(JSON.stringify(data, null, 2));
        process.exit(1);
      }
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    }

    if (command === "delete") {
      if (!parsed.id) {
        console.error("Error: ID is required.");
        process.exit(1);
      }
      const res = await fetchFn(`${baseUrl}/api/notes/${parsed.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Delete failed" }));
        console.error(JSON.stringify(data, null, 2));
        process.exit(1);
      }
      process.exit(0);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}
