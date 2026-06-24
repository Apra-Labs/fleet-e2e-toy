import { Command } from "commander";
import { httpClient, CliError } from "../client";
import { validateOptionalString } from "../validation";

export function makeUpdateCommand(): Command {
  const cmd = new Command("update");
  cmd
    .description("Update an existing note by ID")
    .requiredOption("--id <id>", "ID of the note to update")
    .option("--title <title>", "New title for the note")
    .option("--content <content>", "New content for the note")
    .action(async (options: { id: string; title?: string; content?: string }) => {
      try {
        if (options.title === undefined && options.content === undefined) {
          process.stderr.write("Error: at least one of --title or --content must be provided\n");
          process.exit(1);
        }
        validateOptionalString(options.title, "title");
        validateOptionalString(options.content, "content");

        const body: Record<string, string> = {};
        if (options.title !== undefined) body.title = options.title;
        if (options.content !== undefined) body.content = options.content;

        const result = await httpClient({
          method: "PUT",
          path: `/api/notes/${options.id}`,
          body,
        });
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
