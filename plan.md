# Implementation Plan

## Task 1: Add yargs dependency
- Install yargs and @types/yargs for CLI argument parsing
- Add to devDependencies in package.json

## Task 2: Create CLI entry point with --version flag
- Create `src/cli.ts` with yargs setup
- Add --version flag that reads from package.json
- Test: `node dist/cli.js --version` prints version

## Task 3: Add --help flag with usage info
- Configure yargs help text
- Show available commands and options
- Include examples in help output

## Task 4: Add start command for server
- Create `start` command with --port option
- Default port 3000, configurable via --port
- Start the Express server

## Task 5: Add list command for notes
- Create `list` command to fetch all notes
- Support --tag filter option
- Support --search (-s) option for text search
- Output formatted JSON

## Task 6: Add get command for notes
- Create `get <id>` command
- Fetch single note by ID
- Display formatted note details

## Task 7: Add create command for notes
- Create `create` command with --title and --content options
- Support --tags option (comma-separated)
- Output created note with ID

## Task 8: Add delete command for notes
- Create `delete <id>` command
- Confirm before deletion (prompt user)
- Support --force flag to skip confirmation

## Task 9: Write CLI tests
- Test --version flag output
- Test --help flag output
- Test each command with mocked API calls
- Ensure proper exit codes

## Task 10: Update README and package.json bin
- Add CLI documentation to README.md
- Configure package.json "bin" field
- Add usage examples
