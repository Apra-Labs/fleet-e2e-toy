APPROVED

Notes:
- gh-toy-n05.2 (Version flag): The `--version` and `-v` flags correctly print the version string and exit cleanly with code 0.
- gh-toy-n05.3 (CRUD commands): The five subcommands (`list`, `read`, `create`, `update`, `delete`) correctly validate required inputs, pass query strings/bodies, and throw appropriately on API errors, exiting with 1.
- Both tasks pass the build, linter, and full test suite successfully. No stack traces are output on errors.
