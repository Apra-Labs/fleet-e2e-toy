// Minimal flag parsing for CLI subcommands.
//
// Every CLI flag in this project takes a value (`--id <val>`, `--title <val>`,
// etc.), so a single helper suffices: find the flag token and return the token
// that follows it. A flag given as the final argument (no following value)
// resolves to `undefined`, which the required-argument validator then rejects
// with a clear message — no special-casing needed at the call site.

/**
 * Return the value that follows `flag` in `args`, or `undefined` if the flag is
 * absent or is the last token (i.e. has no value after it).
 */
export function getFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) {
    return undefined;
  }
  return args[index + 1];
}
