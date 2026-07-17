// Integration tests for the CLI's help system and input validation.

import { SUBCOMMANDS } from "../src/cli/help";
import { runCli } from "./helpers/cli-harness";

describe("global help", () => {
  it("--help prints usage listing all subcommands and exits 0", async () => {
    const result = await runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    for (const subcommand of SUBCOMMANDS) {
      expect(result.stdout).toContain(subcommand);
    }
    expect(result.stderr).toBe("");
  });

  it("-h prints usage listing all subcommands and exits 0", async () => {
    const result = await runCli(["-h"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    for (const subcommand of SUBCOMMANDS) {
      expect(result.stdout).toContain(subcommand);
    }
    expect(result.stderr).toBe("");
  });
});

describe("subcommand help", () => {
  it.each(SUBCOMMANDS)("'%s --help' prints that subcommand's usage and exits 0", async (subcommand) => {
    const result = await runCli([subcommand, "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(`Usage: noteapi-cli ${subcommand}`);
    expect(result.stderr).toBe("");
  });

  it.each(SUBCOMMANDS)("'%s -h' prints that subcommand's usage and exits 0", async (subcommand) => {
    const result = await runCli([subcommand, "-h"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(`Usage: noteapi-cli ${subcommand}`);
    expect(result.stderr).toBe("");
  });
});

describe("input validation", () => {
  it("create --title '  ' prints a clear stderr error, exits non-zero, no stack trace", async () => {
    const result = await runCli(["create", "--title", "   ", "--content", "Body"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("--title");
    expect(result.stderr).not.toContain("at ");
    expect(result.stderr).not.toContain(".ts:");
    expect(result.stderr).not.toContain(".js:");
  });

  it("create --content '' (empty) prints a clear stderr error, exits non-zero, no stack trace", async () => {
    const result = await runCli(["create", "--title", "Valid Title", "--content", ""]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--content");
    expect(result.stderr).not.toContain("at ");
  });

  it("read --id '   ' (whitespace-only) prints a clear stderr error, exits non-zero, no stack trace", async () => {
    const result = await runCli(["read", "--id", "   "]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--id");
    expect(result.stderr).not.toContain("at ");
  });

  it("update --id <id> --title '   ' (whitespace-only optional flag) prints a clear stderr error, exits non-zero", async () => {
    const result = await runCli(["update", "--id", "some-id", "--title", "   "]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--title");
    expect(result.stderr).not.toContain("at ");
  });

  it("delete --id '   ' (whitespace-only) prints a clear stderr error, exits non-zero, no stack trace", async () => {
    const result = await runCli(["delete", "--id", "   "]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--id");
    expect(result.stderr).not.toContain("at ");
  });
});
