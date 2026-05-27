#!/usr/bin/env node

// CLI entry point for fleet-e2e-toy

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

// Check for --version or -v flag
if (args.includes('--version') || args.includes('-v')) {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  console.log(`fleet-e2e-toy v${packageJson.version}`);
  process.exit(0);
}

if (args.length === 0) {
  process.exit(0);
}
