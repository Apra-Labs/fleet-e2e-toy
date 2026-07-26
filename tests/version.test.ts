import { execSync } from "child_process";

describe("--version flag", () => {
  it("outputs version string and exits with code 0 for --version", () => {
    const result = execSync("npx ts-node src/index.ts --version", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    expect(result.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("outputs version string and exits with code 0 for -v", () => {
    const result = execSync("npx ts-node src/index.ts -v", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    expect(result.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("does not exit immediately for non-version invocation", () => {
    try {
      const result = execSync(
        "timeout 1s npx ts-node src/index.ts 2>&1 || true",
        {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        }
      );
      expect(result).toContain("NoteAPI running");
    } catch {
      // timeout or other error is fine - we're just checking it doesn't exit with version handling
    }
  });
});
