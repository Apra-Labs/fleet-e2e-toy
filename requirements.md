# Sprint Requirements — fleet-e2e-toy

Sprint: e2e-s8.2-28207769589  
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
