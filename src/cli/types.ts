/**
 * Parsed shape of the CLI invocation. Flags are collected as key/value pairs
 * (`--key value` or `--key=value`); bare `--flag` becomes `{ flag: "true" }`.
 */
export interface ParsedArgs {
  subcommand: string | undefined;
  flags: Record<string, string>;
  positionals: string[];
  /**
   * The raw argv this was parsed from. Command handlers that need to see
   * every occurrence of a repeatable flag (e.g. multiple `--tag`) re-scan
   * this instead of relying on `flags`, which only keeps the last value.
   */
  rawArgv: string[];
}

/** Signature every subcommand handler implements. Returns a process exit code. */
export type CommandHandler = (args: ParsedArgs) => Promise<number> | number;
