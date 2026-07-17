# NoteAPI — Demo Project for Agentic AI Workshop (Advanced)

A deliberately simple REST API used as a live demo prop for the [Agentic AI Workshop (Advanced)](https://github.com/Apra-Labs). The API itself is boring on purpose — the value is in the **agentic configuration around it**.

## What This Repo Demonstrates

Every file in this project exists because a specific workshop slide references it:

| File | Workshop Demo |
|------|---------------|
| `CLAUDE.md` | Concise project instructions (slide 4) |
| `CLAUDE.local.md` | Personal overrides, gitignored in real projects (slide 4) |
| `.claude/rules/api-conventions.md` | Path-scoped rules with YAML frontmatter (slide 4) |
| `.claude/skills/noteapi-devops/SKILL.md` | Skills with progressive disclosure (slide 5) |
| `.claude/settings.json` | Hooks + MCP server configuration (slides 6, 9) |
| `.claude/hooks/block-destructive.sh` | PreToolUse hook that blocks destructive commands (slide 9) |
| `plan.md` | Human-readable plan — same as basic workshop (slide 11) |
| `feature_list.json` | Machine-readable checklist derived from plan (slide 11) |
| `AGENT_PROMPT.md` | Prompt for overnight harness loop (slide 11) |
| `progress.md` | Agent's work log — pre-populated example from a previous run (slides 11, 12) |
| `.github/workflows/ci.yml` | CI pipeline with secrets in GitHub, not on the machine (slides 8, 10) |

## Quick Start

```bash
git clone https://github.com/Apra-Labs/noteapi-demo.git
cd noteapi-demo
npm install
npm test        # all tests passing
npm start       # http://localhost:3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes` | List all notes (optional: `?tag=`, `?q=`) |
| GET | `/api/notes/:id` | Get a note by ID |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/health` | Health check |

## CLI

A `noteapi-cli` command-line client is included for scripting against the API without
writing HTTP calls by hand:

```bash
npm run cli -- list --tag work
npm run cli -- read --id <id>
npm run cli -- create --title "Title" --content "Body text"
npm run cli -- update --id <id> --title "New title"
npm run cli -- delete --id <id>
npm run cli -- --help       # global help
npm run cli -- list --help  # per-subcommand help
npm run cli -- --version    # print CLI version
```

The CLI talks to the API over HTTP (default `http://localhost:3000`, override with
`NOTEAPI_BASE_URL`), rejects empty/whitespace-only flag values with a clear error and
non-zero exit code, and never prints a raw stack trace. See `docs/cli.md` for the full
design and error-handling contract.

## Tech Stack

Node.js + Express + TypeScript, in-memory store, Jest + supertest for tests.

## License

MIT
