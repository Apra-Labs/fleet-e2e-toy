import { Command } from "commander";
import { request } from "../http";
import { requireNonEmptyString } from "../validation";

export const createCommand = new Command("create")
  .description("Create a new note")
  .requiredOption("--title <title>", "Note title")
  .option("--content <content>", "Note content", "")
  .option("--tags <tags>", "Comma-separated tags")
  .exitOverride()
  .action(async function (
    this: Command,
    opts: { title: string; content: string; tags?: string }
  ) {
    const parentOpts = this.parent?.opts<{ baseUrl: string }>();
    const baseUrl =
      parentOpts?.baseUrl ??
      process.env["NOTE_API_URL"] ??
      "http://localhost:3000";

    const title = requireNonEmptyString("title", opts.title);
    const content = opts.content ?? "";
    const tags = opts.tags
      ? opts.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const body = { title, content, tags };
    const result = await request({ method: "POST", baseUrl, path: "/api/notes", body });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  });
