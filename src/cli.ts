#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .version('fleet-e2e-toy v1.0.0')
  .alias('v', 'version')
  .usage('Usage: $0 [options] [command]')
  .command('list', 'List notes', (yargs) => {
    return yargs.option('region', {
      alias: 'r',
      describe: 'Filter by region',
      type: 'string',
    });
  })
  .command('read', 'Read a note', (yargs) => {
    return yargs.option('id', {
      alias: 'i',
      describe: 'Note ID to read',
      type: 'string',
      demandOption: true,
    });
  })
  .command('create', 'Create a note', (yargs) => {
    return yargs
      .option('title', {
        alias: 't',
        describe: 'Note title',
        type: 'string',
        demandOption: true,
      })
      .option('content', {
        alias: 'c',
        describe: 'Note content',
        type: 'string',
        demandOption: true,
      });
  })
  .command('update', 'Update a note', (yargs) => {
    return yargs
      .option('id', {
        alias: 'i',
        describe: 'Note ID to update',
        type: 'string',
        demandOption: true,
      })
      .option('title', {
        alias: 't',
        describe: 'New title',
        type: 'string',
      })
      .option('content', {
        alias: 'c',
        describe: 'New content',
        type: 'string',
      });
  })
  .command('delete', 'Delete a note')
  .help()
  .alias('h', 'help')
  .example('$0 --version', 'Show version')
  .example('$0 list', 'List all notes')
  .example('$0 list --region us-east-1', 'List notes in us-east-1')
  .argv;
