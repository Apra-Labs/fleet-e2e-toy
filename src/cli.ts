#!/usr/bin/env node

// CLI entry point for fleet-e2e-toy

const args = process.argv.slice(2);

if (args.length === 0) {
  process.exit(0);
}
