# Requirements: P1 Sprint

## P1 Issues

### 1. gh-toy-4ef: Add --version flag to CLI

**Description:** The CLI tool should support a --version (or -v) flag that prints the current version string and exits with code 0.

**Acceptance Criteria:**
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0`
- Exit code is 0 when --version is used
- Works alongside other flags

### 2. gh-toy-i5j: Sprint - CLI Implementation for P1 features

**Description:** Epic for implementing CLI features for the note API tool.

**Acceptance Criteria:**
- CLI binary is created and executable
- Version flag works per gh-toy-4ef requirements
- CLI parses command-line arguments correctly
- Basic CLI structure is in place for future commands (list, read, create, update, delete)
