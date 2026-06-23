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
npm test        # 83 tests, all passing
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

A command-line client ships alongside the API server. It communicates with the API over HTTP and requires the server to be running.

```bash
npm run cli -- --help              # global usage
npm run cli -- --version           # print version and exit
npm run cli -- list                # list all notes
npm run cli -- list --tag work     # filter by tag
npm run cli -- list --q "meeting"  # search by query
npm run cli -- read --id <id>      # read a note by ID
npm run cli -- create --title "My note" --content "Body text" --tags "work,ideas"
npm run cli -- update --id <id> --title "New title"
npm run cli -- delete --id <id>
```

The server address defaults to `http://localhost:3000`. Override with `API_URL`:

```bash
API_URL=http://localhost:3001 npm run cli -- list
```

Per-subcommand help is available:

```bash
npm run cli -- create --help
```

See `docs/cli-architecture.md` for design details.

## Tech Stack

Node.js + Express + TypeScript, in-memory store, Jest + supertest for tests.

## License

MIT
