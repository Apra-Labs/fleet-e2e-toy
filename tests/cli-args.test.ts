import { parseFlags, validateNonEmpty, ValidationError } from "../src/cli/args";
import { run } from "../src/cli/index";
import { CommandIO } from "../src/cli/commands";

describe("parseFlags", () => {
  it("parses --flag value pairs", () => {
    expect(parseFlags(["--title", "My Note", "--content", "Body"])).toEqual({
      title: "My Note",
      content: "Body",
    });
  });

  it("captures empty string values passed explicitly", () => {
    expect(parseFlags(["--title", ""])).toEqual({ title: "" });
  });

  it("records boolean-style flags with no following value as empty string", () => {
    expect(parseFlags(["--help"])).toEqual({ help: "" });
  });

  it("supports short -h flag", () => {
    expect(parseFlags(["-h"])).toEqual({ h: "" });
  });
});

describe("validateNonEmpty", () => {
  it("rejects an empty string value", () => {
    expect(() => validateNonEmpty("title", "")).toThrow(ValidationError);
  });

  it("rejects a whitespace-only string value", () => {
    expect(() => validateNonEmpty("content", "   ")).toThrow(ValidationError);
  });

  it("rejects a missing (undefined) value", () => {
    expect(() => validateNonEmpty("id", undefined)).toThrow(ValidationError);
  });

  it("accepts a valid non-empty value and returns it", () => {
    expect(validateNonEmpty("title", "My Note")).toBe("My Note");
  });

  it("names the offending flag in the error message", () => {
    try {
      validateNonEmpty("title", "  ");
      fail("expected validateNonEmpty to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      const validationErr = err as ValidationError;
      expect(validationErr.flag).toBe("title");
      expect(validationErr.message).toContain("--title");
    }
  });
});

function makeIo(): CommandIO & { outLines: string[]; errLines: string[] } {
  const outLines: string[] = [];
  const errLines: string[] = [];
  return {
    outLines,
    errLines,
    out: (line: string) => outLines.push(line),
    err: (line: string) => errLines.push(line),
  };
}

describe("CLI input validation wiring", () => {
  it("create: rejects empty --title with readable stderr error and non-zero exit", async () => {
    const io = makeIo();
    const code = await run(["create", "--title", "", "--content", "Body"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--title");
    expect(io.errLines.join("\n")).not.toContain("at ");
  });

  it("create: rejects whitespace-only --content", async () => {
    const io = makeIo();
    const code = await run(["create", "--title", "My Note", "--content", "   "], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--content");
  });

  it("create: passes validation for valid --title/--content (fails later as not implemented)", async () => {
    const io = makeIo();
    const code = await run(["create", "--title", "My Note", "--content", "Body"], io);
    // Validation passes, so it reaches the not-implemented stub, not a validation error.
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).not.toContain("--title");
    expect(io.errLines.join("\n")).not.toContain("--content");
  });

  it("update: rejects blank --id", async () => {
    const io = makeIo();
    const code = await run(["update", "--id", "  "], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
  });

  it("read: rejects missing --id", async () => {
    const io = makeIo();
    const code = await run(["read"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
  });

  it("read: passes validation for a valid --id", async () => {
    const io = makeIo();
    await run(["read", "--id", "abc123"], io);
    expect(io.errLines.join("\n")).not.toContain("--id is required");
    expect(io.errLines.join("\n")).not.toContain("must not be empty");
  });
});
