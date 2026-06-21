import * as apiClient from "../apiClient";
import { CliError, ParsedArgs } from "../types";
import { requireFlag } from "../validate";

export async function deleteCommand(parsed: ParsedArgs): Promise<void> {
  const id = requireFlag(parsed.flags, "id");

  try {
    await apiClient.deleteNote(id);
    process.stdout.write(`Note ${id} deleted successfully\n`);
  } catch (err) {
    if (err instanceof CliError) {
      throw err;
    }
    throw new CliError("Failed to delete note");
  }
}
