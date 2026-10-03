import { ChildProcess, spawn } from "child_process";
import { createServer, request } from "http";
import { resolve } from "path";

const entryPoint = resolve(__dirname, "../src/index.ts");
const tsNode = resolve(__dirname, "../node_modules/.bin/ts-node");
const PORT = 3056;

function killGroup(child: ChildProcess, signal: NodeJS.Signals): void {
  if (!child.pid) return;
  try {
    process.kill(-child.pid, signal);
  } catch {
    // Process group already gone
  }
}

describe("SIGINT handling", () => {
  test(
    "prints Interrupted. to stderr and exits with code 130",
    async () => {
      let stdout = "";
      let stderr = "";
      const child = spawn(tsNode, [entryPoint], {
        cwd: resolve(__dirname, ".."),
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, PORT: PORT.toString() },
      });

      // Fallback so a failing test never leaks a server
      const fallback = setTimeout(() => killGroup(child, "SIGKILL"), 25000);

      try {
        const result = await new Promise<{
          code: number | null;
          signal: string | null;
        }>((resolvePromise, reject) => {
          child.stderr?.on("data", (d: Buffer) => {
            stderr += d.toString();
          });
          child.stdout?.on("data", (d: Buffer) => {
            stdout += d.toString();
            if (stdout.includes("NoteAPI running")) {
              // Mirrors a terminal Ctrl-C: SIGINT to the whole process group
              killGroup(child, "SIGINT");
            }
          });
          child.on("error", reject);
          child.on("exit", (code, signal) => resolvePromise({ code, signal }));
        });

        expect(result.code).toBe(130);
        expect(result.signal).toBeNull();
        expect(stderr.split("\n")).toContain("Interrupted.");
        expect(stdout).not.toContain("Error");
        expect(stderr).not.toContain("Error");
        expect(stdout + stderr).not.toMatch(/\bat\s+\S*[/\\]\S+/);
      } finally {
        clearTimeout(fallback);
        killGroup(child, "SIGKILL");
      }

      // Port must be free: connection is refused
      const refused = await new Promise<string>((resolvePromise) => {
        const req = request(
          { host: "127.0.0.1", port: PORT, path: "/", timeout: 2000 },
          () => resolvePromise("connected")
        );
        req.on("error", (err: NodeJS.ErrnoException) =>
          resolvePromise(err.code ?? "error")
        );
        req.end();
      });
      expect(refused).toBe("ECONNREFUSED");

      // And a fresh listen on the port succeeds
      await new Promise<void>((resolvePromise, reject) => {
        const srv = createServer();
        srv.on("error", reject);
        srv.listen(PORT, () => srv.close(() => resolvePromise()));
      });
    },
    30000
  );
});
