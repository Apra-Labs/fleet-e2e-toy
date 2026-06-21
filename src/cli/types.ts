export class CliError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "CliError";
  }
}

export interface ParsedArgs {
  command: string | undefined;
  flags: Record<string, string | boolean>;
  positionals: string[];
}

export interface CommandResult {
  exitCode: number;
  output?: string;
}
