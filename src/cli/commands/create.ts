// 'create' subcommand: POST /api/notes. Requires --title and --content;
// supports repeatable --tag flags.

import { CommandIO } from "../commands";
import { parseFlags } from "../args";
import { client } from "../client";
import { formatNote } from "./format";

// Collects every --tag <value> occurrence in argv (parseFlags only keeps the
// last one, but tags are repeatable).
function collectTags(args: string[]): string[] {
  const tags: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tag" && args[i + 1] !== undefined && !args[i + 1].startsWith("-")) {
      tags.push(args[i + 1]);
      i++;
    }
  }
  return tags;
}

export async function createHandler(args: string[], io: CommandIO): Promise<number> {
  const flags = parseFlags(args);
  const tags = collectTags(args);
  const note = await client.create({
    title: flags.title,
    content: flags.content,
    tags,
  });
  io.out(formatNote(note));
  return 0;
}
