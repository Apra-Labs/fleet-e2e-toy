#!/usr/bin/env node
const VERSION = "fleet-e2e-toy v1.0.0";

function main(argv: string[]): number {
  if (argv.includes("--version") || argv.includes("-v")) {
    console.log(VERSION);
    return 0;
  }
  // Placeholder behaviour for non-version invocations; replaced in T1.3.
  return 0;
}

process.exit(main(process.argv.slice(2)));
