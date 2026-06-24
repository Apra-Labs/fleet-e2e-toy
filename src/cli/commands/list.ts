import { Command } from "commander";
import { httpClient, CliError } from "../client";

export function makeListCommand(): Command {
  const cmd = new Command("list");
  cmd
    .description("List all notes, optionally filtered by tag or query")
    .option("--tag <tag>", "Filter notes by tag")
    .option("--q <query>", "Search notes by query string")
    .action(async (options: { tag?: string; q?: string }) => {
      const params = new URLSearchParams();
      if (options.tag) params.set("tag", options.tag);
      if (options.q) params.set("q", options.q);
      const query = params.toString();
      const path = query ? `/api/notes?${query}` : "/api/notes";

      try {
        const result = await httpClient({ method: "GET", path });
        process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      } catch (err) {
        if (err instanceof CliError) {
          process.stderr.write(`Error: ${err.message}\n`);
        } else {
          process.stderr.write(`Error: ${String(err)}\n`);
        }
        process.exit(1);
      }
    });

  return cmd;
}
