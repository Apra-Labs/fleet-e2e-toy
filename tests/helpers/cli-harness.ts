// Shared test harness for CLI integration tests.
// Starts the Express app on a real ephemeral port and invokes the CLI's
// `main()` dispatcher in-process, capturing stdout/stderr and the exit code.

import type { Server } from "http";
import app from "../../src/app";
import { noteStore } from "../../src/models/note";
import { main } from "../../src/cli/index";

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

let server: Server;
let baseUrl: string;

export async function startTestServer(): Promise<string> {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Failed to determine test server address");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
  process.env.NOTEAPI_BASE_URL = baseUrl;
  return baseUrl;
}

export async function stopTestServer(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  delete process.env.NOTEAPI_BASE_URL;
}

export function resetNotes(): void {
  noteStore.clear();
}

/**
 * Invokes the CLI dispatcher in-process with the given argv (excluding
 * `node script` prefix), capturing stdout/stderr writes and the resulting
 * exit code without letting the process actually exit.
 */
export async function runCli(argv: string[]): Promise<CliResult> {
  let stdout = "";
  let stderr = "";

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  const originalExitCode = process.exitCode;

  process.exitCode = 0;

  process.stdout.write = ((chunk: unknown, ..._rest: unknown[]): boolean => {
    stdout += chunk?.toString() ?? "";
    return true;
  }) as typeof process.stdout.write;

  process.stderr.write = ((chunk: unknown, ..._rest: unknown[]): boolean => {
    stderr += chunk?.toString() ?? "";
    return true;
  }) as typeof process.stderr.write;

  try {
    await main(argv);
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }

  const exitCode = process.exitCode ?? 0;
  process.exitCode = originalExitCode;

  return { stdout, stderr, exitCode: Number(exitCode) };
}
