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
  .command("start", "Start the NoteAPI server", (yargs) =>
    yargs.option("port", {
      alias: "p",
      type: "number",
      description: "Port to listen on",
      default: 3000,
    })
  )
  .command("list", "List all notes", () => {})
  .command("get <id>", "Get a note by ID", () => {})
  .command("create", "Create a new note", () => {})
  .command("delete <id>", "Delete a note", () => {})
  .example("$0 start", "Start the server on port 3000")
  .example("$0 start --port 8080", "Start the server on port 8080")
  .example("$0 list", "List all notes")
  .example("$0 get 123", "Get note with ID 123")
  .example("$0 create --title My Note --content Hello", "Create a new note")
  .example("$0 delete 123", "Delete note with ID 123")
  .help()
  .strict()
  .parse();
