import { getNote, CliError, ExitCode } from "../client";
import type { CommandHandler } from "../index";

export const readCommand: CommandHandler = async (flags) => {
  const id = flags["id"];
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new CliError("--id is required", ExitCode.USAGE);
  }

  const note = await getNote(id);
  process.stdout.write(
    `id: ${note.id}\ntitle: ${note.title}\ncontent: ${note.content}\ntags: ${note.tags.join(", ")}\n`
  );
};
