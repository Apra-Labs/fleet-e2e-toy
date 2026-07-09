import * as process from 'process';

export function runCLI(args: string[]) {
  try {
    for (const arg of args) {
      if (arg.trim() === '') {
        console.error("Error: Empty or whitespace-only arguments are not allowed.");
        process.exit(1);
        return;
      }
    }

    if (args.length === 0) {
      printGlobalHelp();
      process.exit(0);
      return;
    }

    const firstArg = args[0];

    if (firstArg === '--help' || firstArg === '-h') {
      printGlobalHelp();
      process.exit(0);
      return;
    }

    // It's a subcommand
    if (args.includes('--help') || args.includes('-h')) {
      printSubcommandHelp(firstArg);
      process.exit(0);
      return;
    }

    console.error(`Error: Unknown command '${firstArg}'`);
    process.exit(1);
    return;

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${errorMsg || 'An unexpected error occurred'}`);
    process.exit(1);
  }
}

export function printGlobalHelp() {
  console.log(`Usage: fleet-e2e-toy <command> [options]

Commands:
  list    List all notes
  read    Get a note by ID
  create  Create a note
  update  Update a note
  delete  Delete a note

Options:
  -h, --help     Show help
  -v, --version  Show version`);
}

export function printSubcommandHelp(subcommand: string) {
  console.log(`Usage: fleet-e2e-toy ${subcommand} [options]

Options:
  -h, --help  Show help for ${subcommand}`);
}

if (require.main === module) {
  runCLI(process.argv.slice(2));
}
