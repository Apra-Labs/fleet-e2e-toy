import { Command } from "commander";
import { request } from "../http";
import { requireNonEmptyString } from "../validation";

export const updateCommand = new Command("update")
  .description("Update an existing note")
  .requiredOption("--id <id>", "Note ID")
  .option("--title <title>", "New title")
  .option("--content <content>", "New content")
  .option("--tags <tags>", "Comma-separated tags")
  .exitOverride()
  .action(async function (
    this: Command,
    opts: { id: string; title?: string; content?: string; tags?: string }
  ) {
    const parentOpts = this.parent?.opts<{ baseUrl: string }>();
    const baseUrl =
      parentOpts?.baseUrl ??
      process.env["NOTE_API_URL"] ??
      "http://localhost:3000";

    if (opts.title === undefined && opts.content === undefined && opts.tags === undefined) {
      process.stderr.write(
        "Error: at least one of --title, --content, or --tags must be provided\n"
      );
      process.exit(1);
    }

    const id = requireNonEmptyString("id", opts.id);

    const body: Record<string, unknown> = {};
    if (opts.title !== undefined) {
      body["title"] = requireNonEmptyString("title", opts.title);
    }
    if (opts.content !== undefined) {
      body["content"] = opts.content;
    }
    if (opts.tags !== undefined) {
      body["tags"] = opts.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    }

    const result = await request({ method: "PUT", baseUrl, path: `/api/notes/${id}`, body });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  });
