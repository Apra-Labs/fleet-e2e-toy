#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .version('fleet-e2e-toy v1.0.0')
  .alias('v', 'version')
  .help()
  .argv;
