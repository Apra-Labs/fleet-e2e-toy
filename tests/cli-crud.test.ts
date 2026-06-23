import * as http from "http";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { createCommand } from "../src/cli/commands/create";
import { listCommand } from "../src/cli/commands/list";
import { readCommand } from "../src/cli/commands/read";
import { updateCommand } from "../src/cli/commands/update";
import { deleteCommand } from "../src/cli/commands/delete";

let server: http.Server;

beforeAll((done) => {
  server = app.listen(0, () => {
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 3000;
    process.env.API_BASE_URL = `http://localhost:${port}`;
    done();
  });
});

afterAll((done) => {
  delete process.env.API_BASE_URL;
  server.close(done);
});

beforeEach(() => {
  noteStore.clear();
});

// Capture stdout/stderr written via process.stdout.write / process.stderr.write
function captureOutput(fn: () => Promise<number>): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";

    const origStdout = process.stdout.write.bind(process.stdout);
    const origStderr = process.stderr.write.bind(process.stderr);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process.stdout.write as any) = (chunk: string) => {
      stdout += chunk;
      return true;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process.stderr.write as any) = (chunk: string) => {
      stderr += chunk;
      return true;
    };

    fn()
      .then((exitCode) => {
        process.stdout.write = origStdout;
        process.stderr.write = origStderr;
        resolve({ stdout, stderr, exitCode });
      })
      .catch((err: unknown) => {
        process.stdout.write = origStdout;
        process.stderr.write = origStderr;
        resolve({ stdout, stderr, exitCode: 1 });
        void err;
      });
  });
}

describe("CLI CRUD end-to-end", () => {
  describe("create", () => {
    it("exits 0 and output contains an id when given valid --title and --content", async () => {
      const { stdout, exitCode } = await captureOutput(() =>
        createCommand(["--title", "Hello", "--content", "World"])
      );
      expect(exitCode).toBe(0);
      // Output should contain a UUID-like id
      expect(stdout).toMatch(/[0-9a-f-]{36}/);
    });

    it("exits non-zero when --title is missing", async () => {
      const { exitCode } = await captureOutput(() =>
        createCommand(["--content", "World"])
      );
      expect(exitCode).not.toBe(0);
    });

    it("exits non-zero when --content is missing", async () => {
      const { exitCode } = await captureOutput(() =>
        createCommand(["--title", "Hello"])
      );
      expect(exitCode).not.toBe(0);
    });
  });

  describe("list", () => {
    it("prints 'No notes found.' when there are no notes", async () => {
      const { stdout, exitCode } = await captureOutput(() => listCommand([]));
      expect(exitCode).toBe(0);
      expect(stdout).toContain("No notes found.");
    });

    it("shows the created note", async () => {
      await captureOutput(() =>
        createCommand(["--title", "My Note", "--content", "Some content"])
      );
      const { stdout, exitCode } = await captureOutput(() => listCommand([]));
      expect(exitCode).toBe(0);
      expect(stdout).toContain("My Note");
    });

    it("filters by --tag", async () => {
      await captureOutput(() =>
        createCommand(["--title", "Tagged", "--content", "c", "--tag", "alpha"])
      );
      await captureOutput(() =>
        createCommand(["--title", "Untagged", "--content", "c"])
      );

      const { stdout: withTag } = await captureOutput(() =>
        listCommand(["--tag", "alpha"])
      );
      expect(withTag).toContain("Tagged");
      expect(withTag).not.toContain("Untagged");
    });
  });

  describe("read", () => {
    it("prints title for an existing note", async () => {
      const { stdout: createOut } = await captureOutput(() =>
        createCommand(["--title", "ReadMe", "--content", "content here"])
      );
      // Extract ID from create output (first token)
      const id = createOut.trim().split(/\s+/)[0];

      const { stdout, exitCode } = await captureOutput(() =>
        readCommand(["--id", id])
      );
      expect(exitCode).toBe(0);
      expect(stdout).toContain("ReadMe");
    });

    it("exits non-zero for a bogus id", async () => {
      const { exitCode } = await captureOutput(() =>
        readCommand(["--id", "does-not-exist"])
      );
      expect(exitCode).not.toBe(0);
    });

    it("exits non-zero when --id is missing", async () => {
      const { exitCode } = await captureOutput(() => readCommand([]));
      expect(exitCode).not.toBe(0);
    });
  });

  describe("update", () => {
    it("updates title and subsequent read shows the new title", async () => {
      const { stdout: createOut } = await captureOutput(() =>
        createCommand(["--title", "OldTitle", "--content", "c"])
      );
      const id = createOut.trim().split(/\s+/)[0];

      const { exitCode: updateCode } = await captureOutput(() =>
        updateCommand(["--id", id, "--title", "NewTitle"])
      );
      expect(updateCode).toBe(0);

      const { stdout: readOut } = await captureOutput(() =>
        readCommand(["--id", id])
      );
      expect(readOut).toContain("NewTitle");
    });

    it("exits non-zero when --id is missing", async () => {
      const { exitCode } = await captureOutput(() =>
        updateCommand(["--title", "Whatever"])
      );
      expect(exitCode).not.toBe(0);
    });
  });

  describe("delete", () => {
    it("exits 0 when deleting an existing note", async () => {
      const { stdout: createOut } = await captureOutput(() =>
        createCommand(["--title", "ToDelete", "--content", "c"])
      );
      const id = createOut.trim().split(/\s+/)[0];

      const { exitCode } = await captureOutput(() =>
        deleteCommand(["--id", id])
      );
      expect(exitCode).toBe(0);
    });

    it("subsequent read exits non-zero after deletion", async () => {
      const { stdout: createOut } = await captureOutput(() =>
        createCommand(["--title", "GoneNote", "--content", "c"])
      );
      const id = createOut.trim().split(/\s+/)[0];

      await captureOutput(() => deleteCommand(["--id", id]));

      const { exitCode } = await captureOutput(() =>
        readCommand(["--id", id])
      );
      expect(exitCode).not.toBe(0);
    });

    it("exits non-zero when --id is missing", async () => {
      const { exitCode } = await captureOutput(() => deleteCommand([]));
      expect(exitCode).not.toBe(0);
    });
  });
});
