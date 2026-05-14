# Sprint Plan — CLI Enhancements

## Feature: Version Flag (gh-toy-4ef)
- [ ] Implement --version and -v flags in the CLI entry point
- [ ] Ensure it prints " fleet-e2e-toy v1.0.0\ and exits 0
- [ ] Add unit test for version flag

## Feature: Help Command (gh-toy-kbk)
- [ ] Implement help subcommand and --help / -h flags
- [ ] Ensure output matches requirements and lists all commands/flags
- [ ] Add unit test for help command

## Feature: Input Validation (gh-toy-v6z)
- [ ] Add validation for empty or whitespace-only strings in the CLI input handler
- [ ] Ensure it prints an error to stderr and exits non-zero
- [ ] Add unit test for empty/whitespace input

## Verify Checkpoint (verify)
- [ ] Run full build and test suite
- [ ] Manually verify CLI flags and commands
