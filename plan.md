# Plan: P1 Sprint - CLI Implementation

## Task 1: Create CLI entry point
- Create `src/cli.ts` with basic CLI structure using yargs
- Add shebang for executable
- Set up basic argument parsing

## Task 2: Add --version flag
- Implement --version flag that prints "fleet-e2e-toy v1.0.0"
- Ensure exit code 0 on version display
- Add short -v alias

## Task 3: Add --help flag
- Implement --help with usage information
- Document available commands and options

## Task 4: Create list command structure
- Add list command to CLI
- Accept --region filter option
- Set up command handler

## Task 5: Create read command structure
- Add read command to CLI
- Accept --id option for specific note
- Set up command handler

## Task 6: Create create command structure
- Add create command to CLI
- Accept --title and --content options
- Set up command handler

## Task 7: Create update command structure
- Add update command to CLI
- Require --id, optional --title/--content
- Set up command handler

## Task 8: Create delete command structure
- Add delete command to CLI
- Accept --id option
- Set up command handler

## Task 9: Build and configure package.json
- Add bin entry to package.json for CLI
- Configure build script to include CLI
- Ensure npm link works

## Task 10: Integration tests
- Write tests for --version flag
- Write tests for --help flag
- Write tests for command structure
