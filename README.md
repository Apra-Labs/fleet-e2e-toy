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
npm test        # 65 tests, all passing
npm start       # http://localhost:3000
npm run build   # produces dist/ including dist/cli/index.js
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

## CLI (`notecli`)

After `npm run build`, the `notecli` binary is available at `dist/cli/index.js`. Set `NOTECLI_BASE_URL` to target a non-default server address (default: `http://localhost:3000`).

```bash
node dist/cli/index.js --help

# Subcommands
node dist/cli/index.js list [--tag <tag>] [--q <query>]
node dist/cli/index.js read --id <id>
node dist/cli/index.js create --title <title> --content <content>
node dist/cli/index.js update --id <id> [--title <title>] [--content <content>]
node dist/cli/index.js delete --id <id>
```

All subcommands print API JSON to stdout, write errors to stderr, and exit non-zero on failure. Empty or whitespace-only flag values are rejected before any network call. See `docs/cli-api-contracts.md` for the full contract.

## Tech Stack

Node.js + Express + TypeScript, in-memory store, Jest + supertest for tests. CLI uses Commander for argument parsing and Node.js built-in `fetch` for HTTP.

## License

MIT
