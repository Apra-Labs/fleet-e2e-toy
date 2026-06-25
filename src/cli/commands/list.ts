import { Command } from "commander";
import { request } from "../http";

export const listCommand = new Command("list")
  .description("List all notes")
  .option("--tag <tag>", "Filter by tag")
  .option("--q <query>", "Search query")
  .exitOverride()
  .action(async function (this: Command, opts: { tag?: string; q?: string }) {
    const parentOpts = this.parent?.opts<{ baseUrl: string }>();
    const baseUrl =
      parentOpts?.baseUrl ??
      process.env["NOTE_API_URL"] ??
      "http://localhost:3000";

    const query: Record<string, string> = {};
    if (opts.tag) query["tag"] = opts.tag;
    if (opts.q) query["q"] = opts.q;

    const result = await request({ method: "GET", baseUrl, path: "/api/notes", query });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  });
