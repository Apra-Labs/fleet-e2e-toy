#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs";
import * as path from "path";

const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

yargs(hideBin(process.argv))
  .version(pkg.version)
  .usage("Usage: $0 <command> [options]")
  .command(
    "start",
    "Start the NoteAPI server",
    (yargs) =>
      yargs.option("port", {
        alias: "p",
        type: "number",
        description: "Port to listen on",
        default: 3000,
      }),
    (argv) => {
      const app = require("./app").default;
      const port = argv.port as number;
      app.listen(port, () => {
        console.log(`NoteAPI running on http://localhost:${port}`);
      });
    }
  )
  .command("list", "List all notes", () => {}, async () => {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/notes`);
    const notes = await response.json();
    console.log(JSON.stringify(notes, null, 2));
  })
  .command(
    "get <id>",
    "Get a note by ID",
    () => {},
    async (argv) => {
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/notes/${argv.id}`);
      if (!response.ok) {
        console.error("Note not found");
        process.exit(1);
      }
      const note = await response.json();
      console.log(JSON.stringify(note, null, 2));
    }
  )
  .command(
    "create",
    "Create a new note",
    (yargs) =>
      yargs
        .option("title", {
          alias: "t",
          type: "string",
          description: "Note title",
          demandOption: true,
        })
        .option("content", {
          alias: "c",
          type: "string",
          description: "Note content",
          demandOption: true,
        })
        .option("tags", {
          type: "string",
          description: "Comma-separated tags",
        }),
    async (argv) => {
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const tags = argv.tags ? argv.tags.split(",").map((t) => t.trim()) : [];
      const response = await fetch(`${baseUrl}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: argv.title,
          content: argv.content,
          tags,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        console.error("Failed to create note:", err);
        process.exit(1);
      }
      const note = await response.json();
      console.log("Created note:", JSON.stringify(note, null, 2));
    }
  )
  .command(
    "delete <id>",
    "Delete a note",
    (yargs) =>
      yargs.option("force", {
        alias: "f",
        type: "boolean",
        description: "Skip confirmation",
        default: false,
      }),
    async (argv) => {
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      if (!argv.force) {
        const readline = require("readline");
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        const answer = await new Promise<string>((resolve) =>
          rl.question(`Delete note ${argv.id}? (y/N) `, resolve)
        );
        rl.close();
        if (answer.toLowerCase() !== "y") {
          console.log("Cancelled");
          process.exit(0);
        }
      }
      const response = await fetch(`${baseUrl}/api/notes/${argv.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Note not found");
        process.exit(1);
      }
      console.log(`Deleted note ${argv.id}`);
    }
  )
  .example("$0 start", "Start the server on port 3000")
  .example("$0 start --port 8080", "Start the server on port 8080")
  .example("$0 list", "List all notes")
  .example("$0 get 123", "Get note with ID 123")
  .example("$0 create --title My Note --content Hello", "Create a new note")
  .example("$0 delete 123", "Delete note with ID 123")
  .help()
  .strict()
  .parse();
