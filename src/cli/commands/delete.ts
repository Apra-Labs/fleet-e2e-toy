import { deleteNote, ApiError } from "../apiClient";

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Execute the `delete` subcommand.
 * Flags: --id <id> (REQUIRED)
 */
export async function runDelete(argv: string[]): Promise<CliResult> {
  let id: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--id" && argv[i + 1] !== undefined) {
      id = argv[i + 1];
      i++;
    }
  }

  if (!id) {
    return {
      stdout: "",
      stderr: "Usage: cli delete --id <id>\nError: --id is required",
      exitCode: 1,
    };
  }

  try {
    await deleteNote(id);
    return { stdout: `Note "${id}" deleted successfully.`, stderr: "", exitCode: 0 };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) {
        return {
          stdout: "",
          stderr: `Error: Note with id "${id}" not found`,
          exitCode: 1,
        };
      }
      return { stdout: "", stderr: `Error: ${err.message}`, exitCode: 1 };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { stdout: "", stderr: `Error: ${message}`, exitCode: 1 };
  }
}
