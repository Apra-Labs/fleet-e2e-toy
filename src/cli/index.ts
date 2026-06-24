#!/usr/bin/env node
import { Command } from "commander";
import { httpClient, CliError } from "./client";
import { validateRequiredString, validateOptionalString } from "./validation";
import { makeListCommand } from "./commands/list";
import { makeReadCommand } from "./commands/read";

// Smoke imports — modules are exercised here to satisfy bundler/type-checker
void httpClient;
void CliError;
void validateRequiredString;
void validateOptionalString;

const program = new Command();

program
  .name("notecli")
  .description("Command-line client for the NoteAPI service")
  .version("1.0.0");

program.addCommand(makeListCommand());
program.addCommand(makeReadCommand());

program.parseAsync(process.argv).catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
