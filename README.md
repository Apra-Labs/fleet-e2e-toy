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
| GET | `/api/notes` | List notes — paginated envelope (optional: `?tag=`, `?q=`, `?page=`, `?limit=`) |
| GET | `/api/notes/:id` | Get a note by ID |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/:id` | Update a note — `updatedAt` is always refreshed |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/health` | Health check |

### GET /api/notes — Paginated Response

The list endpoint returns a pagination envelope, not a bare array:

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

`page` defaults to `1`; `limit` defaults to `20` (max `100`). Pagination is applied after `tag` and `q` filtering.

### Input Constraints

| Field | Rule |
|-------|------|
| `title` | Required on create; max 200 characters (measured after trim) |
| `content` | Required on create; max 10 000 characters |

## Tech Stack

Node.js + Express + TypeScript, in-memory store, Jest + supertest for tests.

## License

MIT
