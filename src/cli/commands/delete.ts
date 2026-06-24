import { Command } from "commander";
import { httpClient, CliError } from "../client";
import { validateRequiredString } from "../validation";

export function makeDeleteCommand(): Command {
  const cmd = new Command("delete");
  cmd
    .description("Delete a note by ID")
    .requiredOption("--id <id>", "ID of the note to delete")
    .action(async (options: { id: string }) => {
      try {
        validateRequiredString(options.id, "id");
        await httpClient({ method: "DELETE", path: `/notes/${options.id}` });
        process.stdout.write("Note deleted successfully.\n");
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
