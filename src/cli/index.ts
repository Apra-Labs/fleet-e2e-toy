#!/usr/bin/env node
import { Command } from "commander";
import { httpClient, CliError } from "./client";
import { validateRequiredString, validateOptionalString } from "./validation";
import { makeListCommand } from "./commands/list";
import { makeReadCommand } from "./commands/read";
import { makeCreateCommand } from "./commands/create";
import { makeUpdateCommand } from "./commands/update";
import { makeDeleteCommand } from "./commands/delete";

// Smoke imports — modules are exercised here to satisfy bundler/type-checker
void httpClient;
void CliError;
void validateRequiredString;
void validateOptionalString;

const program = new Command();

program
  .name("notecli")
  .description("Command-line client for the NoteAPI service")
  .version("1.0.0")
  .addHelpText(
    "after",
    `
Subcommands:
  list      List all notes (optionally filtered by --tag or --q)
  read      Read a single note by --id
  create    Create a new note with --title and --content
  update    Update a note by --id (provide --title and/or --content)
  delete    Delete a note by --id`
  );

program.addCommand(makeListCommand());
program.addCommand(makeReadCommand());
program.addCommand(makeCreateCommand());
program.addCommand(makeUpdateCommand());
program.addCommand(makeDeleteCommand());

// Unknown subcommand: print usage to stderr and exit non-zero
program.on("command:*", () => {
  const unknownCmd = program.args[0];
  process.stderr.write(`Error: unknown subcommand '${unknownCmd}'\n\n`);
  process.stderr.write(program.helpInformation());
  process.exit(1);
});

program.parseAsync(process.argv).catch((err: unknown) => {
  if (err instanceof CliError) {
    process.stderr.write(`Error: ${err.message}\n`);
  } else {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
  }
  process.exit(1);
});
