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
npm test        # 111 tests, all passing
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

A command-line interface is included at `src/cli/cli.ts` (compiled to `dist/cli/cli.js`).

```bash
node dist/cli/cli.js --help                          # global help
node dist/cli/cli.js --version                       # print version and exit
node dist/cli/cli.js list [--tag <tag>] [--q <q>]   # list notes
node dist/cli/cli.js read --id <id>                  # get one note
node dist/cli/cli.js create --title <t> --content <c> [--tag <tag>]
node dist/cli/cli.js update --id <id> [--title <t>] [--content <c>]
node dist/cli/cli.js delete --id <id>
```

All commands accept `--json` for machine-readable JSON output. Errors are always written to stderr as `{ "error": "message" }`. Exit codes: 0 success, 1 error, 130 interrupted (Ctrl-C).

The CLI base URL is resolved in priority order: `NOTEAPI_URL` env var, `url` in `~/.fleet-e2e-toy.yaml`, default `http://localhost:3000`.

See `docs/cli-architecture.md` and `docs/cli-commands.md` for full details.

## Tech Stack

Node.js + Express + TypeScript, in-memory store, Jest + supertest for tests.

## License

MIT
