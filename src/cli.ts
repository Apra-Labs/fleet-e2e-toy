#!/usr/bin/env ts-node

function main() {
  const args = process.argv.slice(2);
  const firstArg = args[0];

  if (firstArg === '--version' || firstArg === '-v') {
    console.log('fleet-e2e-toy v1.0.0');
    process.exit(0);
  }

  if (firstArg === 'help' || firstArg === '--help' || firstArg === '-h') {
    const usage = `Usage: fleet-e2e-toy [options] [command]

Options:
  -v, --version  Show version number
  -h, --help     Show help

Commands:
  help           Show help`;
    console.log(usage);
    process.exit(0);
  }
}

main();
