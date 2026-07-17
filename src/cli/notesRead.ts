// Read-side NoteAPI CLI subcommands: `list` and `read`.
//
// These are registered into the shared command registry (see commands.ts) as a
// side effect of importing this module; index.ts imports it so the dispatcher
// can find them. Each command object is also exported so unit tests can invoke
// `run` directly.
//
// Error handling is intentionally NOT done here: `request` (http.ts) throws a
// typed ApiError whose message is already normalized, and the dispatcher
// (index.ts) turns any thrown error into `Error: <message>` on stderr with a
// non-zero exit and no stack trace. Reusing that path is the required behaviour.

import type { Note } from "../models/note";
import { Command, CommandContext, registerCommand } from "./commands";
import { request } from "./http";
import { getFlag } from "./flags";
import { requireNonBlank } from "./validate";

/** Render a note (or list of notes) to stdout as formatted JSON. */
function printNotes(value: Note | Note[]): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/** `list [--tag <tag>] [--q <query>]` — GET /api/notes with optional filters. */
export const listCommand: Command = {
  name: "list",
  description: "List notes, optionally filtered by tag or search query.",
  usage: "list [--tag <tag>] [--q <query>]",
  async run(ctx: CommandContext): Promise<void> {
    const tag = getFlag(ctx.args, "--tag");
    const q = getFlag(ctx.args, "--q");

    // Append query params only when actually provided.
    const params = new URLSearchParams();
    if (tag !== undefined) {
      params.set("tag", tag);
    }
    if (q !== undefined) {
      params.set("q", q);
    }
    const query = params.toString();
    const path = query.length > 0 ? `/api/notes?${query}` : "/api/notes";

    const notes = await request<Note[]>(path);
    printNotes(notes);
  },
};

/** `read --id <id>` — GET /api/notes/:id ('--id' required, validated first). */
export const readCommand: Command = {
  name: "read",
  description: "Fetch and print a single note by id.",
  usage: "read --id <id>",
  async run(ctx: CommandContext): Promise<void> {
    const id = requireNonBlank(getFlag(ctx.args, "--id"), "--id");
    const note = await request<Note>(`/api/notes/${encodeURIComponent(id)}`);
    printNotes(note);
  },
};

registerCommand(listCommand);
registerCommand(readCommand);
