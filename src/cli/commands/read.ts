import { Command } from "commander";
import { httpClient, CliError } from "../client";
import { validateRequiredString } from "../validation";

export function makeReadCommand(): Command {
  const cmd = new Command("read");
  cmd
    .description("Read a single note by ID")
    .requiredOption("--id <id>", "ID of the note to read")
    .action(async (options: { id: string }) => {
      try {
        validateRequiredString(options.id, "id");
        const result = await httpClient({ method: "GET", path: `/api/notes/${options.id}` });
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
