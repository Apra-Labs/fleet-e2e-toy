# Sprint Requirements — fleet-e2e-toy

Sprint: e2e-s1.2-26527886489  
Repo: https://github.com/Apra-Labs/fleet-e2e-toy  
Base branch: main

---

## gh-toy-4ef · Add --version flag to CLI

**Type:** feature  
**Priority:** P1  
**External:** gh-1

**Description:**  
The CLI tool should support a `--version` (or `-v`) flag that prints the current version string and exits with code 0.

**Acceptance Criteria:**
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0`
- Exit code is 0
- Works alongside other flags

---

## gh-toy-v6z · [bug] Add input validation for empty or blank strings

**Type:** bug  
**Priority:** P1  
**External:** gh-2

**Description:**  
When a user passes an empty string or whitespace-only string as an argument, the tool should reject it with a clear error message instead of silently proceeding or crashing.

**Acceptance Criteria:**
- Passing empty or whitespace-only string prints a user-friendly error message
- Exits with non-zero exit code
- A unit test is added covering this behaviour

---

## gh-toy-kbk · Implement a help command

**Type:** feature  
**Priority:** P1  
**External:** gh-3

**Description:**  
Add a help subcommand (and `--help` / `-h` flag) that prints usage information for all available commands and flags.

**Acceptance Criteria:**
- `./tool help` and `./tool --help` both work
- Lists every subcommand and flag
- Exit code is 0
