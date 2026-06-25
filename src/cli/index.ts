#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CliValidationError, validateNonEmpty } from './validation';
import { listNotes, getNote, createNote, updateNote, deleteNote } from './api-client';
import * as pkg from '../../package.json';

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
    const version = `fleet-e2e-toy v${(pkg as { version: string }).version}`;
    await yargs(hideBin(process.argv))
      .scriptName('fleet-e2e-toy')
      .usage('Usage: $0 <command> [options]')
      .version('version', 'Print version and exit', version)
      .alias('version', 'V')
      .command(
        'list',
        'List all notes',
        (y) =>
          y
            .option('tag', {
              type: 'string',
              description: 'Filter by tag',
            })
            .option('q', {
              type: 'string',
              description: 'Search query',
            }),
        async (argv) => {
          if (argv.tag !== undefined) validateNonEmpty(argv.tag, 'tag');
          if (argv.q !== undefined) validateNonEmpty(argv.q, 'q');
          const notes = await listNotes(argv.tag, argv.q);
          if (notes.length === 0) {
            process.stdout.write('No notes found.\n');
          } else {
            for (const note of notes) {
              process.stdout.write(`${note.id}\t${note.title}\n`);
            }
          }
        }
      )
      .command(
        'read',
        'Read a note by ID',
        (y) =>
          y.option('id', {
            type: 'string',
            description: 'Note ID',
            demandOption: true,
          }),
        async (argv) => {
          validateNonEmpty(argv.id, 'id');
          const note = await getNote(argv.id);
          process.stdout.write(`id:        ${note.id}\n`);
          process.stdout.write(`title:     ${note.title}\n`);
          process.stdout.write(`tags:      ${note.tags.join(', ') || '(none)'}\n`);
          process.stdout.write(`createdAt: ${note.createdAt}\n`);
          process.stdout.write(`content:\n${note.content}\n`);
        }
      )
      .command(
        'create',
        'Create a new note',
        (y) =>
          y
            .option('title', {
              type: 'string',
              description: 'Note title',
              demandOption: true,
            })
            .option('content', {
              type: 'string',
              description: 'Note content',
              demandOption: true,
            })
            .option('tag', {
              type: 'string',
              description: 'Tag (repeatable)',
              array: true,
            }),
        async (argv) => {
          validateNonEmpty(argv.title, 'title');
          validateNonEmpty(argv.content, 'content');
          const tags = argv.tag as string[] | undefined;
          const note = await createNote(argv.title, argv.content, tags);
          process.stdout.write(`created ${note.id}: ${note.title}\n`);
        }
      )
      .command(
        'update',
        'Update a note by ID',
        (y) =>
          y
            .option('id', {
              type: 'string',
              description: 'Note ID',
              demandOption: true,
            })
            .option('title', {
              type: 'string',
              description: 'New title',
            })
            .option('content', {
              type: 'string',
              description: 'New content',
            }),
        async (argv) => {
          validateNonEmpty(argv.id, 'id');
          if (argv.title === undefined && argv.content === undefined) {
            throw new CliValidationError('at least one of --title or --content must be provided');
          }
          if (argv.title !== undefined) validateNonEmpty(argv.title, 'title');
          if (argv.content !== undefined) validateNonEmpty(argv.content, 'content');
          const updates: { title?: string; content?: string } = {};
          if (argv.title !== undefined) updates.title = argv.title;
          if (argv.content !== undefined) updates.content = argv.content;
          const note = await updateNote(argv.id, updates);
          process.stdout.write(`updated ${note.id}\n`);
        }
      )
      .command(
        'delete',
        'Delete a note by ID',
        (y) =>
          y.option('id', {
            type: 'string',
            description: 'Note ID',
            demandOption: true,
          }),
        async (argv) => {
          validateNonEmpty(argv.id, 'id');
          await deleteNote(argv.id);
          process.stdout.write(`deleted ${argv.id}\n`);
        }
      )
      .demandCommand(1, 'You must specify a command.')
      .strict()
      .help()
      .parse();
  } catch (error) {
    handleError(error);
  }
}

main();
