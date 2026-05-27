function printHelp() {
  console.log("Usage: fleet-e2e-toy [command] [options]\n");
  console.log("Commands:");
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

  const firstArg = args[0];

  if (firstArg === 'help' || firstArg === '--help' || firstArg === '-h') {
    printHelp();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
