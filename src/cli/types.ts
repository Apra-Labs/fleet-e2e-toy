export interface ParsedArgs {
  command?: string;
  args: string[];
  json: boolean;
  version: boolean;
  help: boolean;
}

export interface OutputWriter {
  text(s: string): void;
  json(o: unknown): void;
  error(msg: string): void;
}
