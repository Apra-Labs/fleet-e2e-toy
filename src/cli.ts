#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('version', {
    alias: 'v',
    describe: 'Show version number',
    type: 'boolean',
  })
  .help()
  .argv;
