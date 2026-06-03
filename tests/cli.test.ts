import path from "path";
import { spawnSync } from "child_process";
import { runCli } from "../src/cli";

// Set a generous timeout for all tests (smoke tests need ts-node cold start)
jest.setTimeout(20000);

const REPO_ROOT = path.resolve(__dirname, "..");
const TS_NODE =
  process.platform === "win32"
    ? "node_modules\\.bin\\ts-node.cmd"
    : "node_modules/.bin/ts-node";

describe("runCli — unit tests (synthetic argv)", () => {
  describe("--help flag", () => {
    it("handles --help", () => {
      const result = runCli(["node", "s", "--help"]);
      expect(result.handled).toBe(true);
      expect(result.exitCode).toBe(0);
    });

    it("handles -h", () => {
      const result = runCli(["node", "s", "-h"]);
      expect(result.handled).toBe(true);
      expect(result.exitCode).toBe(0);
    });

    it("handles positional 'help' subcommand", () => {
      const result = runCli(["node", "s", "help"]);
      expect(result.handled).toBe(true);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("--version flag", () => {
    it("handles --version", () => {
      const result = runCli(["node", "s", "--version"]);
      expect(result.handled).toBe(true);
      expect(result.exitCode).toBe(0);
    });

    it("handles -v", () => {
      const result = runCli(["node", "s", "-v"]);
      expect(result.handled).toBe(true);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("no flag", () => {
    it("returns handled:false when no CLI flags given", () => {
      const result = runCli(["node", "s"]);
      expect(result.handled).toBe(false);
    });
  });

  describe("flag priority", () => {
    it("returns handled:true when both --help and --version are present", () => {
      const result = runCli(["node", "s", "--help", "--version"]);
      expect(result.handled).toBe(true);
    });
  });
});

describe("runCli — stdout content tests", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("--version output includes 'noteapi v1.0.0'", () => {
    runCli(["node", "s", "--version"]);
    const output = logSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(output).toContain("noteapi v1.0.0");
  });

  it("--help output includes --help, --version, and PORT", () => {
    runCli(["node", "s", "--help"]);
    const output = logSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(output).toContain("--help");
    expect(output).toContain("--version");
    expect(output).toContain("PORT");
  });
});

describe("CLI smoke tests (spawnSync)", () => {
  it("ts-node src/index.ts --version exits 0 and prints noteapi v1.0.0", () => {
    const result = spawnSync(TS_NODE, ["src/index.ts", "--version"], {
      cwd: REPO_ROOT,
      shell: true,
    });
    expect(result.status).toBe(0);
    expect(result.stdout.toString().trim()).toBe("noteapi v1.0.0");
  });

  it("ts-node src/index.ts -v exits 0 and prints noteapi v1.0.0", () => {
    const result = spawnSync(TS_NODE, ["src/index.ts", "-v"], {
      cwd: REPO_ROOT,
      shell: true,
    });
    expect(result.status).toBe(0);
    expect(result.stdout.toString().trim()).toBe("noteapi v1.0.0");
  });

  it("ts-node src/index.ts --help exits 0 and includes expected tokens", () => {
    const result = spawnSync(TS_NODE, ["src/index.ts", "--help"], {
      cwd: REPO_ROOT,
      shell: true,
    });
    expect(result.status).toBe(0);
    const stdout = result.stdout.toString();
    expect(stdout).toContain("noteapi");
    expect(stdout).toContain("--help");
    expect(stdout).toContain("--version");
    expect(stdout).toContain("PORT");
  });

  it("ts-node src/index.ts -h exits 0 and includes expected tokens", () => {
    const result = spawnSync(TS_NODE, ["src/index.ts", "-h"], {
      cwd: REPO_ROOT,
      shell: true,
    });
    expect(result.status).toBe(0);
    const stdout = result.stdout.toString();
    expect(stdout).toContain("noteapi");
    expect(stdout).toContain("--help");
    expect(stdout).toContain("--version");
    expect(stdout).toContain("PORT");
  });
});
