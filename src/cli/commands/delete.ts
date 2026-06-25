import { Command } from "commander";
import { request } from "../http";
import { requireNonEmptyString } from "../validation";

export const deleteCommand = new Command("delete")
  .description("Delete a note by ID")
  .requiredOption("--id <id>", "Note ID")
  .exitOverride()
  .action(async function (this: Command, opts: { id: string }) {
    const parentOpts = this.parent?.opts<{ baseUrl: string }>();
    const baseUrl =
      parentOpts?.baseUrl ??
      process.env["NOTE_API_URL"] ??
      "http://localhost:3000";

    const id = requireNonEmptyString("id", opts.id);
    await request({ method: "DELETE", baseUrl, path: `/api/notes/${id}` });
    process.stdout.write(`Deleted note ${id}\n`);
  });
