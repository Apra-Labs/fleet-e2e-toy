import { OutputWriter } from "./types";

export function createOutputWriter(json: boolean): OutputWriter {
  if (json) {
    return {
      text(_s: string): void {
        // In JSON mode, human text is suppressed; structured output goes through json()
      },
      json(o: unknown): void {
        process.stdout.write(JSON.stringify(o) + "\n");
      },
      error(msg: string): void {
        process.stdout.write(JSON.stringify({ error: msg }) + "\n");
      },
    };
  }

  return {
    text(s: string): void {
      process.stdout.write(s + "\n");
    },
    json(_o: unknown): void {
      // In text mode, json() is a no-op; callers must use text() for human output
    },
    error(msg: string): void {
      process.stderr.write("Error: " + msg + "\n");
    },
  };
}
