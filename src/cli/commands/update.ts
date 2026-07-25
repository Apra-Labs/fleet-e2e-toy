import { CommandHandler } from "../types";
import { apiClient } from "../apiClient";
import { requireNonBlank, optionalNonBlank } from "../validate";
import { UpdateNoteInput } from "../../models/note";

/**
 * `cli update --id <id> [--title <title>] [--content <content>] [--tag <tag> ...]`
 * Updates fields on an existing note via PUT and prints the result.
 */
export const updateCommand: CommandHandler = async (args) => {
  const id = requireNonBlank(args.flags.id, "id");
  const title = optionalNonBlank(args.flags.title, "title");
  const content = optionalNonBlank(args.flags.content, "content");

  const input: UpdateNoteInput = {};
  if (title !== undefined) input.title = title;
  if (content !== undefined) input.content = content;

  const tags: string[] = [];
  for (let i = 0; i < args.rawArgv.length; i++) {
    if (args.rawArgv[i] === "--tag" && args.rawArgv[i + 1] !== undefined) {
      tags.push(args.rawArgv[i + 1]);
      i++;
    }
  }
  if (tags.length > 0) input.tags = tags;

  const note = await apiClient.updateNote(id, input);

  process.stdout.write(`Updated note:\n${JSON.stringify(note, null, 2)}\n`);
  return 0;
};
