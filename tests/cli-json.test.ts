import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { run } from "../src/cli/run";
import { cleanupAll } from "../src/cli/tempfiles";

describe("run -- write subcommand and JSON mode", () => {
  let stdoutChunks: string[];
  let stderrChunks: string[];
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;
  let tmpFile: string;

  beforeEach(() => {
    stdoutChunks = [];
    stderrChunks = [];
    stdoutSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation((chunk: unknown) => {
        stdoutChunks.push(String(chunk));
        return true;
      });
    stderrSpy = jest
      .spyOn(process.stderr, "write")
      .mockImplementation((chunk: unknown) => {
        stderrChunks.push(String(chunk));
        return true;
      });
    tmpFile = path.join(os.tmpdir(), `fleet-json-test-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    // clean up any temp files created during test
    cleanupAll();
    if (fs.existsSync(tmpFile)) {
      fs.rmSync(tmpFile, { force: true });
    }
  });

  it("write --json returns 0 and produces valid JSON with correct fields", async () => {
    const code = await run(["write", tmpFile, "--json"]);
    expect(code).toBe(0);
    const output = stdoutChunks.join("").trim();
    const parsed = JSON.parse(output) as Record<string, unknown>;
    expect(parsed).toEqual({ command: "write", path: tmpFile, status: "ok" });
    expect(fs.existsSync(tmpFile)).toBe(true);
  });

  it("write (text mode) returns 0, stdout contains human text, file exists", async () => {
    const code = await run(["write", tmpFile]);
    expect(code).toBe(0);
    const output = stdoutChunks.join("");
    expect(output).toContain("Wrote " + tmpFile);
    // Should not be a JSON object
    expect(() => JSON.parse(output.trim())).toThrow();
    expect(fs.existsSync(tmpFile)).toBe(true);
  });

  it("write --json with missing filename returns non-zero and JSON error on stdout", async () => {
    const code = await run(["write", "--json"]);
    expect(code).not.toBe(0);
    const output = stdoutChunks.join("").trim();
    const parsed = JSON.parse(output) as Record<string, unknown>;
    expect(parsed).toEqual({ error: "write requires a filename" });
  });

  it("write (text mode) with missing filename returns non-zero and Error on stderr", async () => {
    const code = await run(["write"]);
    expect(code).not.toBe(0);
    const errOutput = stderrChunks.join("");
    expect(errOutput).toContain("Error: write requires a filename");
    expect(stdoutChunks).toHaveLength(0);
  });
});
