import { runCli } from "../src/cli";

describe("runCli", () => {
  describe("--version flag", () => {
    it("returns version with --version flag", () => {
      const result = runCli(["--version"]);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("fleet-e2e-toy");
      expect(result.output).toContain("1.0.0");
    });

    it("returns version with -v flag", () => {
      const result = runCli(["-v"]);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("fleet-e2e-toy");
      expect(result.output).toContain("1.0.0");
    });
  });

  describe("input validation", () => {
    it("rejects empty string argument", () => {
      const result = runCli([""]);
      expect(result.exitCode).toBe(1);
      expect(result.output).toBe("Error: input must not be empty");
    });

    it("rejects whitespace-only argument", () => {
      const result = runCli(["   "]);
      expect(result.exitCode).toBe(1);
      expect(result.output).toBe("Error: input must not be empty");
    });
  });
});
