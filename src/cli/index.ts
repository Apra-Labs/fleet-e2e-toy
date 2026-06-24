#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("notecli")
  .description("Command-line client for the NoteAPI service")
  .version("1.0.0");

// Subcommands are added in later tasks; this is the scaffold root command.

program.parseAsync(process.argv).catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
