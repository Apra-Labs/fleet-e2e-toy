import { CommandHandler } from "../types";
import { apiClient } from "../apiClient";
import { requireNonBlank } from "../validate";

/**
 * Collects all `--tag` occurrences from argv. The hand-rolled parser only
 * keeps the last value for a repeated flag, so we re-scan the raw args here
 * to support multiple `--tag` flags.
 */
function collectTags(rawArgv: string[]): string[] {
  const tags: string[] = [];
  for (let i = 0; i < rawArgv.length; i++) {
    if (rawArgv[i] === "--tag" && rawArgv[i + 1] !== undefined) {
      tags.push(rawArgv[i + 1]);
      i++;
    }
  }
  return tags;
}

/**
 * `cli create --title <title> --content <content> [--tag <tag> ...]`
 * Creates a note and prints it (including its generated id).
 */
export const createCommand: CommandHandler = async (args) => {
  const title = requireNonBlank(args.flags.title, "title");
  const content = requireNonBlank(args.flags.content, "content");
  const tags = collectTags(args.rawArgv);

  const note = await apiClient.createNote({ title, content, tags });

  process.stdout.write(`Created note:\n${JSON.stringify(note, null, 2)}\n`);
  return 0;
};
