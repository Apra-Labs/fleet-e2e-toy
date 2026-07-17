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
npm test        # 21 tests, all passing
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

A command-line client (`noteapi-cli`, entry point `src/cli.ts`, compiled to
`dist/cli.js`) talks to the running API over HTTP:

```bash
npm run build
NOTEAPI_URL=http://localhost:3000 node dist/cli.js list
node dist/cli.js create --title "Groceries" --content "Milk, eggs" --tags food,home
node dist/cli.js read --id <id>
node dist/cli.js update --id <id> --content "Milk, eggs, bread"
node dist/cli.js delete --id <id>
node dist/cli.js --help       # or -h, global or per-subcommand
node dist/cli.js --version    # or -v
```

Base URL defaults to `http://localhost:3000` and is overridden via the
`NOTEAPI_URL` environment variable. See `docs/cli.md` for the full design
(HTTP-client-only architecture, validation and error-handling contract,
subcommand reference).

## Tech Stack

Node.js + Express + TypeScript, in-memory store, Jest + supertest for tests.

## License

MIT
