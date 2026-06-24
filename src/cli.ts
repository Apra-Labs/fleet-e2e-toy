#!/usr/bin/env node

import * as http from "http";

const VERSION = "fleet-e2e-toy v1.0.0";
const BASE_URL = process.env.API_URL || "http://localhost:3000";

interface CliResult {
  status: number;
  body: string;
}

function request(
  method: string,
  path: string,
  body?: string
): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options: http.RequestOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: body ? { "Content-Type": "application/json" } : {},
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode || 500, body: data });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function printHelp() {
  console.log(`Usage: noteapi <command> [options]

Commands:
  list      List notes (optional: --tag, --q, --json)
  read      Read a note by ID (--id required)
  create    Create a note (--title, --content required; --tags optional)
  update    Update a note (--id required; --title, --content, --tags optional)
  delete    Delete a note (--id required)
  --version Print version
  --help    Show this help message

Global options:
  --help, -h    Show help
  --version, -v Show version`);
}

function printListHelp() {
  console.log(`Usage: noteapi list [options]

Options:
  --tag <tag>   Filter by tag
  --q <query>   Search in title and content
  --json        Output raw JSON (default: formatted)
  --help, -h    Show this help message`);
}

function printReadHelp() {
  console.log(`Usage: noteapi read --id <id> [options]

Options:
  --id <id>     Note ID (required)
  --help, -h    Show this help message`);
}

function printCreateHelp() {
  console.log(`Usage: noteapi create --title <title> --content <content> [options]

Options:
  --title <title>     Note title (required)
  --content <content> Note content (required)
  --tags <tags>       Comma-separated tags
  --help, -h          Show this help message`);
}

function printUpdateHelp() {
  console.log(`Usage: noteapi update --id <id> [options]

Options:
  --id <id>           Note ID (required)
  --title <title>     New title
  --content <content> New content
  --tags <tags>       Comma-separated tags
  --help, -h          Show this help message`);
}

function printDeleteHelp() {
  console.log(`Usage: noteapi delete --id <id> [options]

Options:
  --id <id>     Note ID (required)
  --help, -h    Show this help message`);
}

function parseArgs(args: string[]): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith("-") && !arg.startsWith("--")) {
      const key = arg.slice(1);
      if (key === "h" || key === "v") {
        result[key] = true;
      } else if (key.length > 1 && i + 1 < args.length && !args[i + 1].startsWith("-")) {
        result[key] = args[i + 1];
        i += 2;
      } else {
        result[key] = true;
        i++;
      }
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (key === "help" || key === "h" || key === "version" || key === "v") {
        result[key] = true;
      } else if (i + 1 < args.length && !args[i + 1].startsWith("--") && !args[i + 1].startsWith("-")) {
        result[key] = args[i + 1];
        i += 2;
      } else {
        result[key] = true;
        i++;
      }
    } else {
      i++;
    }
  }
  return result;
}

function validateNonEmpty(value: string | boolean | undefined, field: string): string | null {
  if (value === undefined || value === true) {
    return `Error: --${field} is required`;
  }
  if (typeof value === "string" && value.trim().length === 0) {
    return `Error: --${field} cannot be empty or whitespace`;
  }
  return null;
}

async function cmdList(args: string[]) {
  const opts = parseArgs(args);
  if (opts.help || opts.h) {
    printListHelp();
    process.exit(0);
  }

  const tag = typeof opts.tag === "string" ? opts.tag : undefined;
  const q = typeof opts.q === "string" ? opts.q : undefined;
  const jsonMode = opts.json === true;

  let path = "/api/notes";
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const qs = params.toString();
  if (qs) path += `?${qs}`;

  try {
    const res = await request("GET", path);
    if (jsonMode) {
      console.log(res.body);
    } else {
      const notes = JSON.parse(res.body);
      if (notes.length === 0) {
        console.log("No notes found.");
      } else {
        for (const note of notes) {
          const tags = note.tags.length > 0 ? ` [${note.tags.join(", ")}]` : "";
          console.log(`${note.id}: ${note.title}${tags}`);
        }
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

async function cmdRead(args: string[]) {
  const opts = parseArgs(args);
  if (opts.help || opts.h) {
    printReadHelp();
    process.exit(0);
  }

  const idErr = validateNonEmpty(opts.id, "id");
  if (idErr) {
    console.error(idErr);
    process.exit(1);
  }

  try {
    const res = await request("GET", `/api/notes/${opts.id}`);
    if (res.status === 404) {
      console.error(`Error: Note '${opts.id}' not found`);
      process.exit(1);
    }
    console.log(res.body);
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

async function cmdCreate(args: string[]) {
  const opts = parseArgs(args);
  if (opts.help || opts.h) {
    printCreateHelp();
    process.exit(0);
  }

  const titleErr = validateNonEmpty(opts.title, "title");
  if (titleErr) {
    console.error(titleErr);
    process.exit(1);
  }

  const contentErr = validateNonEmpty(opts.content, "content");
  if (contentErr) {
    console.error(contentErr);
    process.exit(1);
  }

  const tags = typeof opts.tags === "string"
    ? opts.tags.split(",").map((t) => t.trim())
    : [];

  const body = JSON.stringify({
    title: opts.title,
    content: opts.content,
    tags,
  });

  try {
    const res = await request("POST", "/api/notes", body);
    console.log(res.body);
    process.exit(res.status >= 400 ? 1 : 0);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

async function cmdUpdate(args: string[]) {
  const opts = parseArgs(args);
  if (opts.help || opts.h) {
    printUpdateHelp();
    process.exit(0);
  }

  const idErr = validateNonEmpty(opts.id, "id");
  if (idErr) {
    console.error(idErr);
    process.exit(1);
  }

  const updateBody: Record<string, unknown> = {};
  if (typeof opts.title === "string") updateBody.title = opts.title;
  if (typeof opts.content === "string") updateBody.content = opts.content;
  if (typeof opts.tags === "string") {
    updateBody.tags = opts.tags.split(",").map((t) => t.trim());
  }

  if (Object.keys(updateBody).length === 0) {
    console.error("Error: at least one of --title, --content, --tags is required");
    process.exit(1);
  }

  try {
    const res = await request("PUT", `/api/notes/${opts.id}`, JSON.stringify(updateBody));
    if (res.status === 404) {
      console.error(`Error: Note '${opts.id}' not found`);
      process.exit(1);
    }
    console.log(res.body);
    process.exit(res.status >= 400 ? 1 : 0);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

async function cmdDelete(args: string[]) {
  const opts = parseArgs(args);
  if (opts.help || opts.h) {
    printDeleteHelp();
    process.exit(0);
  }

  const idErr = validateNonEmpty(opts.id, "id");
  if (idErr) {
    console.error(idErr);
    process.exit(1);
  }

  try {
    const res = await request("DELETE", `/api/notes/${opts.id}`);
    if (res.status === 204) {
      console.log("Note deleted");
      process.exit(0);
    }
    console.error(res.body);
    process.exit(1);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];

  if (command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    process.exit(0);
  }

  const rest = args.slice(1);

  switch (command) {
    case "list":
      await cmdList(rest);
      break;
    case "read":
      await cmdRead(rest);
      break;
    case "create":
      await cmdCreate(rest);
      break;
    case "update":
      await cmdUpdate(rest);
      break;
    case "delete":
      await cmdDelete(rest);
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      console.error(`Run 'noteapi --help' for available commands.`);
      process.exit(1);
  }
}

main();
