import { ParsedArgs } from "./types";

export function parseArgs(argv: string[]): ParsedArgs {
  let command: string | undefined;
  const args: string[] = [];
  let json = false;
  let version = false;
  let help = false;

  for (const token of argv) {
    if (token === "--version" || token === "-v") {
      version = true;
    } else if (token === "--json") {
      json = true;
    } else if (token === "--help" || token === "-h") {
      help = true;
    } else if (token.startsWith("-")) {
      // Unknown flag — preserve in args
      args.push(token);
    } else if (command === undefined) {
      command = token;
    } else {
      args.push(token);
    }
  }

  return { command, args, json, version, help };
}
