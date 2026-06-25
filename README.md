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

## CLI — fleet-e2e-toy

The repo ships a `fleet-e2e-toy` CLI binary that calls the NoteAPI over HTTP.

```bash
npm run build                   # compile TypeScript → dist/
npx fleet-e2e-toy --help        # global help
npx fleet-e2e-toy --version     # prints "fleet-e2e-toy v1.0.0"

# CRUD subcommands
npx fleet-e2e-toy list [--tag <tag>] [--q <query>]
npx fleet-e2e-toy read  --id <id>
npx fleet-e2e-toy create --title <title> --content <content> [--tag <tag>]...
npx fleet-e2e-toy update --id <id> [--title <title>] [--content <content>]
npx fleet-e2e-toy delete --id <id>
```

Set `NOTEAPI_URL` to point the CLI at a non-default server (default: `http://localhost:3000`).

Exit codes: 0 = success, 1 = general error, 2 = validation error.

See `docs/features/cli.md` for the full command reference, flag table, and error-handling contract.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes` | List all notes (optional: `?tag=`, `?q=`) |
| GET | `/api/notes/:id` | Get a note by ID |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/health` | Health check |

## Tech Stack

Node.js + Express + TypeScript, in-memory store, Jest + supertest for tests. CLI uses yargs and built-in Node 20 `fetch`.

## License

MIT
