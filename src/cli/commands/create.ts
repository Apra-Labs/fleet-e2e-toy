import { Command } from "commander";
import { httpClient, CliError } from "../client";
import { validateRequiredString } from "../validation";

export function makeCreateCommand(): Command {
  const cmd = new Command("create");
  cmd
    .description("Create a new note")
    .requiredOption("--title <title>", "Title of the note")
    .requiredOption("--content <content>", "Content of the note")
    .action(async (options: { title: string; content: string }) => {
      try {
        validateRequiredString(options.title, "title");
        validateRequiredString(options.content, "content");
        const result = await httpClient({
          method: "POST",
          path: "/notes",
          body: { title: options.title, content: options.content },
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
