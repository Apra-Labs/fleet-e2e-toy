// Write-side NoteAPI CLI subcommands: `create`, `update`, and `delete`.
//
// Registered into the shared command registry (see commands.ts) as a side
// effect of importing this module; index.ts imports it so the dispatcher can
// find them. Each command object is also exported so unit tests can invoke
// `run` directly.
//
// As with the read-side commands, error handling is delegated: `request`
// (http.ts) throws a typed ApiError whose message is already normalized —
// including the server's `{ errors: [...] }` validation-failure shape — and the
// dispatcher (index.ts) turns any thrown error into `Error: <message>` on
// stderr with a non-zero exit and no stack trace.

import type { Note, UpdateNoteInput } from "../models/note";
import { Command, CommandContext, registerCommand } from "./commands";
import { request } from "./http";
import { getFlag } from "./flags";
import { CliValidationError, requireNonBlank } from "./validate";

/** Render a note to stdout as formatted JSON. */
function printNote(note: Note): void {
  process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
}

/** `create --title <title> --content <content>` — POST /api/notes. */
export const createCommand: Command = {
  name: "create",
  description: "Create a new note with a title and content.",
  usage: "create --title <title> --content <content>",
  async run(ctx: CommandContext): Promise<void> {
    const title = requireNonBlank(getFlag(ctx.args, "--title"), "--title");
    const content = requireNonBlank(getFlag(ctx.args, "--content"), "--content");

    const note = await request<Note>("/api/notes", {
      method: "POST",
      body: { title, content },
    });
    printNote(note);
  },
};

/**
 * `update --id <id> [--title <title>] [--content <content>]` — PUT
 * /api/notes/:id. '--id' is required; title/content are optional but each is
 * validated non-blank when present, and at least one must be supplied.
 */
export const updateCommand: Command = {
  name: "update",
  description: "Update a note's title and/or content by id.",
  usage: "update --id <id> [--title <title>] [--content <content>]",
  async run(ctx: CommandContext): Promise<void> {
    const id = requireNonBlank(getFlag(ctx.args, "--id"), "--id");

    const rawTitle = getFlag(ctx.args, "--title");
    const rawContent = getFlag(ctx.args, "--content");

    if (rawTitle === undefined && rawContent === undefined) {
      throw new CliValidationError(
        "--title/--content",
        "specify '--title' and/or '--content' to update"
      );
    }

    const updates: UpdateNoteInput = {};
    if (rawTitle !== undefined) {
      updates.title = requireNonBlank(rawTitle, "--title");
    }
    if (rawContent !== undefined) {
      updates.content = requireNonBlank(rawContent, "--content");
    }

    const note = await request<Note>(
      `/api/notes/${encodeURIComponent(id)}`,
      { method: "PUT", body: updates }
    );
    printNote(note);
  },
};

/** `delete --id <id>` — DELETE /api/notes/:id (204 no content on success). */
export const deleteCommand: Command = {
  name: "delete",
  description: "Delete a note by id.",
  usage: "delete --id <id>",
  async run(ctx: CommandContext): Promise<void> {
    const id = requireNonBlank(getFlag(ctx.args, "--id"), "--id");
    await request<undefined>(`/api/notes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    process.stdout.write(`Deleted note ${id}\n`);
  },
};

registerCommand(createCommand);
registerCommand(updateCommand);
registerCommand(deleteCommand);
