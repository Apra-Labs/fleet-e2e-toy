APPROVED

gh-toy-sal.3: Help system is fully implemented. --help/-h with no subcommand prints a usage summary listing all subcommands (list, read, create, update, delete) and global flags (--url, -h/--help, -v/--version), then exits 0. --help/-h after any subcommand prints that subcommand's usage with its specific flags, then exits 0. Running the CLI with no arguments prints the same usage summary (exits 1 as a usage error). Help text accurately reflects the required and optional flags of each subcommand. No stack traces in any help output path. tsc build and lint pass.

gh-toy-sal.4: Input validation is fully implemented and fires before any API call. Missing required flags (read/update/delete without --id, create without --title or --content) produce a clear error on stderr naming the offending flag and exit code 1. Empty or whitespace-only values for --title, --content, or --id are rejected with a clear error message and exit code 1 without making any HTTP request. Error messages name the offending flag. No stack traces. tsc build and lint pass.

reopenIds: []
newTasks: []
