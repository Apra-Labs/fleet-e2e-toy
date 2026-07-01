import { createNote, CliError, ExitCode } from "../client";
import type { CommandHandler } from "../index";

export const createCommand: CommandHandler = async (flags) => {
  const title = flags["title"];
  const content = flags["content"];

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new CliError("--title is required and must be a non-empty string", ExitCode.VALIDATION);
  }
  if (typeof content !== "string") {
    throw new CliError("--content is required", ExitCode.VALIDATION);
  }

  // --tag may be given once or as comma-separated values
  const tagRaw = flags["tag"];
  let tags: string[] = [];
  if (typeof tagRaw === "string" && tagRaw.trim().length > 0) {
    tags = tagRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  }

  const note = await createNote({ title: title.trim(), content, tags });
  process.stdout.write(`${note.id}\n`);
};
