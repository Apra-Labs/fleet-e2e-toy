#!/usr/bin/env ts-node

function printHelp() {
  console.log('Usage: fleet-e2e-toy [command] [options]');
  console.log('');
  console.log('Commands:');
  console.log('  add            Add a new note');
  console.log('  serve          Start the notes API server');
  console.log('  help           Display help information');
  console.log('');
  console.log('Options:');
  console.log('  -v, --version  Show version information');
  console.log('  -h, --help     Show help information');
}

function main() {
  const args = process.argv.slice(2);

  // Validate that no command line argument is empty or whitespace-only
  for (const arg of args) {
    if (arg.trim() === '') {
      console.error('Error: Empty or whitespace-only arguments are not allowed.');
      process.exit(1);
    }
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('fleet-e2e-toy v1.0.0');
    process.exit(0);
  }

  if (args.includes('--help') || args.includes('-h') || args[0] === 'help') {
    printHelp();
    process.exit(0);
  }

  // Validate that the title argument is present and non-blank when using 'add'
  if (args[0] === 'add') {
    const title = args[1];
    if (title === undefined || title.trim() === '') {
      console.error('Error: The title argument is required for the "add" command and cannot be blank.');
      process.exit(1);
    }
  }
}

main();
