#!/usr/bin/env node
import { Command, CommanderError } from "commander";
import { listCommand } from "./commands/list";
import { readCommand } from "./commands/read";
import { createCommand } from "./commands/create";
import { updateCommand } from "./commands/update";
import { deleteCommand } from "./commands/delete";

const program = new Command();

program
  .name("note")
  .description("NoteAPI CLI — manage notes via the REST API")
  .version("fleet-e2e-toy v1.0.0", "-V, --version", "output the version number")
  .option("--base-url <url>", "NoteAPI base URL", process.env["NOTE_API_URL"] ?? "http://localhost:3000")
  .exitOverride();

program.addCommand(listCommand);
program.addCommand(readCommand);
program.addCommand(createCommand);
program.addCommand(updateCommand);
program.addCommand(deleteCommand);

(async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    if (err instanceof CommanderError) {
      if (
        err.code === "commander.helpDisplayed" ||
        err.code === "commander.version"
      ) {
        process.exit(0);
      }
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }
    if (err instanceof Error) {
      process.stderr.write(`Error: ${err.message}\n`);
    } else {
      process.stderr.write("An unknown error occurred\n");
    }
    process.exit(1);
  }
})();
