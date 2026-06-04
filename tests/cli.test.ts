import { execSync, spawn } from "child_process";

describe("CLI entrypoint", () => {
  it("prints version for --version and -v", () => {
    const out1 = execSync("npx ts-node src/cli.ts --version").toString().trim();
    expect(out1).toBe("fleet-e2e-toy v1.0.0");

    const out2 = execSync("npx ts-node src/cli.ts -v").toString().trim();
    expect(out2).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints help for help, --help, -h", () => {
    const expectedHelp = `fleet-e2e-toy — NoteAPI CLI

Usage:
  ./tool [command] [flags]

Commands:
  help              Show this help message

Flags:
  --help, -h        Show this help message
  --version, -v     Print version and exit`;

    const out1 = execSync("npx ts-node src/cli.ts help").toString().trim();
    expect(out1).toBe(expectedHelp);

    const out2 = execSync("npx ts-node src/cli.ts --help").toString().trim();
    expect(out2).toBe(expectedHelp);

    const out3 = execSync("npx ts-node src/cli.ts -h").toString().trim();
    expect(out3).toBe(expectedHelp);
  });

  it("exits with 1 and prints error to stderr for empty/blank arguments", () => {
    try {
      execSync('npx ts-node src/cli.ts ""', { stdio: "pipe" });
      throw new Error("should have thrown");
    } catch (err: unknown) {
      const error = err as { status: number; stderr: Buffer };
      expect(error.status).toBe(1);
      expect(error.stderr.toString().trim()).toBe("Error: Arguments cannot be empty or whitespace-only.");
    }

    try {
      execSync('npx ts-node src/cli.ts "   "', { stdio: "pipe" });
      throw new Error("should have thrown");
    } catch (err: unknown) {
      const error = err as { status: number; stderr: Buffer };
      expect(error.status).toBe(1);
      expect(error.stderr.toString().trim()).toBe("Error: Arguments cannot be empty or whitespace-only.");
    }
  });

  it("starts the server when run with no arguments", (done) => {
    const server = spawn("node", ["-r", "ts-node/register", "src/cli.ts"], {
      env: { ...process.env, PORT: "3001" }
    });

    const timer = setTimeout(() => {
      server.kill();
      done(new Error("Server failed to start or print startup message in time: " + output));
    }, 5000);

    let output = "";
    server.stdout.on("data", (data) => {
      output += data.toString();
      if (output.includes("NoteAPI running on http://localhost:3001")) {
        clearTimeout(timer);
        server.kill();
        done();
      }
    });

    server.on("error", (err) => {
      clearTimeout(timer);
      server.kill();
      done(err);
    });
  });
});
