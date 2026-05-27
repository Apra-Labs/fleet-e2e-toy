function printHelp() {
  console.log("Usage: fleet-e2e-toy [command] [options]\n");
  console.log("Commands:");
  console.log("  add <title>      Add a new note");
  console.log("  serve            Start the API server");
  console.log("  help             Show this help message\n");
  console.log("Options:");
  console.log("  --version, -v    Show version information");
  console.log("  --help, -h       Show this help message");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    console.log('fleet-e2e-toy v1.0.0');
    process.exit(0);
  }

  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const firstArg = args[0];

  if (firstArg.trim() === '') {
    console.error('Error: Argument cannot be empty or whitespace-only.');
    process.exit(1);
  }

  if (firstArg === 'help' || firstArg === '--help' || firstArg === '-h') {
    printHelp();
    process.exit(0);
  }

  if (firstArg === 'add') {
    const title = args.slice(1).join(' '); // or args[1]? Let's see what is standard. The plan says "add <title> should print 'Note added: <title>'". If <title> can be passed as a single arg, args[1] is fine. Let's do args[1] || ''.
    const titleVal = args[1] || '';
    console.log(`Note added: ${titleVal}`);
    process.exit(0);
  }

  if (firstArg === 'serve') {
    console.log('Starting server...');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
