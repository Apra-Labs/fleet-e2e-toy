import { Command } from "commander";
import { request } from "../http";
import { requireNonEmptyString } from "../validation";

export const readCommand = new Command("read")
  .description("Read a note by ID")
  .requiredOption("--id <id>", "Note ID")
  .exitOverride()
  .action(async function (this: Command, opts: { id: string }) {
    const parentOpts = this.parent?.opts<{ baseUrl: string }>();
    const baseUrl =
      parentOpts?.baseUrl ??
      process.env["NOTE_API_URL"] ??
      "http://localhost:3000";

    const id = requireNonEmptyString("id", opts.id);
    const result = await request({ method: "GET", baseUrl, path: `/api/notes/${id}` });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  });
