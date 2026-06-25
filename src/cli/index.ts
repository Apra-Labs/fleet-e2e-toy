#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CliValidationError } from './validation';

function notImplemented(cmd: string): void {
  process.stderr.write(`${cmd}: not implemented yet\n`);
  process.exit(1);
}

function handleError(error: unknown): never {
  if (error instanceof CliValidationError) {
    process.stderr.write(`error: ${error.message}\n`);
    process.exit(2);
  }

  if (error instanceof Error) {
    process.stderr.write(`error: ${error.message}\n`);
    process.exit(1);
  }

  process.stderr.write(`error: Unknown error\n`);
  process.exit(1);
}

async function main() {
  try {
    await yargs(hideBin(process.argv))
      .scriptName('fleet-e2e-toy')
      .usage('Usage: $0 <command> [options]')
      .command('list', 'List all notes', () => {}, () => notImplemented('list'))
      .command('read <id>', 'Read a note by ID', () => {}, () => notImplemented('read'))
      .command('create', 'Create a new note', () => {}, () => notImplemented('create'))
      .command('update <id>', 'Update a note by ID', () => {}, () => notImplemented('update'))
      .command('delete <id>', 'Delete a note by ID', () => {}, () => notImplemented('delete'))
      .demandCommand(1, 'You must specify a command.')
      .strict()
      .help()
      .parse();
  } catch (error) {
    handleError(error);
  }
}

main();
