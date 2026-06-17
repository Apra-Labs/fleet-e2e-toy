# P1 Sprint Requirements

## Issue gh-toy-i5j: P1 sprint: CLI Implementation for P1 features

**Type:** Epic/Task
**Priority:** P1
**Description:** Implement CLI features for the NoteAPI project. This epic covers building a command-line interface that allows users to interact with the NoteAPI directly from the terminal.

**Acceptance Criteria:**
- CLI tool can be invoked via `npx noteapi` or `./bin/noteapi`
- All CRUD operations available via CLI commands
- Proper help output and version display
- Error handling with appropriate exit codes

---

## Issue gh-toy-4ef: Add --version flag to CLI

**Type:** Feature
**Priority:** P1
**Description:** The CLI tool should support a --version (or -v) flag that prints the current version string and exits with code 0.

**Acceptance Criteria:**
- Running `noteapi --version` prints `noteapi v1.0.0`
- Running `noteapi -v` also works
- Exit code is 0 on success
- Works alongside other flags without conflict

---

## Summary

This sprint implements a CLI for the NoteAPI project with:
1. Version flag (--version, -v)
2. Help output (--help, -h)
3. Server start command
4. Note CRUD commands (list, get, create, delete)
5. Tests for all CLI functionality
