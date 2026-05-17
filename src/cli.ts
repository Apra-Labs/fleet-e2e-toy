#!/usr/bin/env ts-node

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: tool [options] [command]");
    process.exit(0);
  }

  // Basic flag handling
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--version" || arg === "-v") {
      console.log("fleet-e2e-toy v1.0.0");
      process.exit(0);
    }
  }
}

main();
