#!/usr/bin/env node

// CLI entry point for fleet-e2e-toy

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

const helpText = `Usage: fleet-e2e-toy [command] [options]

Commands:
  help        Show this help message
  add         Add a new note

Options:
  --version, -v    Show version information
  --help, -h       Show this help message`;

// Check for --version or -v flag
if (args.includes('--version') || args.includes('-v')) {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  console.log(`fleet-e2e-toy v${packageJson.version}`);
  process.exit(0);
}

// Check for help subcommand or --help / -h flags
if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
  console.log(helpText);
  process.exit(0);
}

if (args.length === 0) {
  process.exit(0);
}
