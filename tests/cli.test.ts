import { Server } from "http";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { run } from "../src/cli";

let server: Server;

function captureOutput(): { stdout: () => string; stderr: () => string; restore: () => void } {
  let stdoutBuf = "";
  let stderrBuf = "";

  const stdoutSpy = jest
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk: unknown): boolean => {
      stdoutBuf += chunk as string;
      return true;
    });
  const stderrSpy = jest
    .spyOn(process.stderr, "write")
    .mockImplementation((chunk: unknown): boolean => {
      stderrBuf += chunk as string;
      return true;
    });

  return {
    stdout: () => stdoutBuf,
    stderr: () => stderrBuf,
    restore: () => {
      stdoutSpy.mockRestore();
      stderrSpy.mockRestore();
    },
  };
}

async function runCli(argv: string[]): Promise<{ stdout: string; stderr: string; exitCode: number | undefined }> {
  process.exitCode = undefined;
  const capture = captureOutput();
  try {
    await run(argv);
  } finally {
    capture.restore();
  }
  const exitCode = process.exitCode;
  process.exitCode = undefined;
  return { stdout: capture.stdout(), stderr: capture.stderr(), exitCode };
}

beforeAll((done) => {
  server = app.listen(0, () => {
    const address = server.address();
    const port = typeof address === "object" && address !== null ? address.port : 3000;
    process.env.NOTEAPI_URL = `http://localhost:${port}`;
    done();
  });
});

afterAll((done) => {
  server.close(() => done());
});

beforeEach(() => {
  noteStore.clear();
});

describe("CLI subcommands - happy path", () => {
  it("create then read/list/update/delete a note end-to-end", async () => {
    const createResult = await runCli([
      "create",
      "--title",
      "My Note",
      "--content",
      "Some content",
      "--tags",
      "a,b",
    ]);
    expect(createResult.exitCode).toBeUndefined();
    const created = JSON.parse(createResult.stdout);
    expect(created.id).toBeDefined();
    expect(created.title).toBe("My Note");
    expect(created.tags).toEqual(["a", "b"]);

    const readResult = await runCli(["read", "--id", created.id]);
    expect(readResult.exitCode).toBeUndefined();
    const read = JSON.parse(readResult.stdout);
    expect(read.id).toBe(created.id);
    expect(read.title).toBe("My Note");

    const listResult = await runCli(["list"]);
    expect(listResult.exitCode).toBeUndefined();
    const list = JSON.parse(listResult.stdout);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);

    const listByTagResult = await runCli(["list", "--tag", "a"]);
    const listByTag = JSON.parse(listByTagResult.stdout);
    expect(listByTag).toHaveLength(1);

    const updateResult = await runCli(["update", "--id", created.id, "--title", "Updated Title"]);
    expect(updateResult.exitCode).toBeUndefined();
    const updated = JSON.parse(updateResult.stdout);
    expect(updated.title).toBe("Updated Title");
    expect(updated.content).toBe("Some content");

    const deleteResult = await runCli(["delete", "--id", created.id]);
    expect(deleteResult.exitCode).toBeUndefined();
    const deleted = JSON.parse(deleteResult.stdout);
    expect(deleted).toEqual({ deleted: created.id });

    const readAfterDelete = await runCli(["read", "--id", created.id]);
    expect(readAfterDelete.exitCode).toBe(1);
  });
});

describe("CLI --help / -h", () => {
  it("prints global usage on --help with exit 0", async () => {
    const result = await runCli(["--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: fleet-e2e-toy <subcommand> [flags]");
  });

  it("prints global usage on -h with exit 0", async () => {
    const result = await runCli(["-h"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: fleet-e2e-toy <subcommand> [flags]");
  });

  it("prints per-subcommand usage on 'create --help' with exit 0", async () => {
    const result = await runCli(["create", "--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: fleet-e2e-toy create --title <title> --content <content> [--tags <csv>]");
  });

  it("prints per-subcommand usage on 'read -h' with exit 0", async () => {
    const result = await runCli(["read", "-h"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: fleet-e2e-toy read --id <id>");
  });
});

describe("CLI --version / -v", () => {
  it("prints version on --version with exit 0", async () => {
    const result = await runCli(["--version"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("fleet-e2e-toy v1.0.0\n");
  });

  it("prints version on -v with exit 0", async () => {
    const result = await runCli(["-v"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("fleet-e2e-toy v1.0.0\n");
  });
});

describe("CLI input validation", () => {
  it("rejects a missing required flag with stderr message and exit 1, no stack trace", async () => {
    const result = await runCli(["read"]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("id is required and must not be empty");
    expect(result.stderr).not.toContain("at ");
    expect(result.stdout).toBe("");
  });

  it("rejects an empty-string required flag with stderr message and exit 1", async () => {
    const result = await runCli(["create", "--title", "", "--content", "Body"]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("title is required and must not be empty");
    expect(result.stderr).not.toContain("at ");
  });

  it("rejects a whitespace-only required flag with stderr message and exit 1", async () => {
    const result = await runCli(["delete", "--id", "   "]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("id is required and must not be empty");
    expect(result.stderr).not.toContain("at ");
  });
});
