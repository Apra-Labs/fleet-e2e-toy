#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('fleet-e2e-toy')
  .description('CLI for NoteAPI')
  .version('fleet-e2e-toy v1.0.0', '-v, --version', 'output the version number');

program.parse(process.argv);
