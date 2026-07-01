import { validateRequired } from "../src/cli/validation";
import { CliError, ExitCode } from "../src/cli/client";

describe("validateRequired", () => {
  it("returns the trimmed string when value is valid", () => {
    expect(validateRequired("--title", "hello")).toBe("hello");
    expect(validateRequired("--title", "  hello  ")).toBe("hello");
  });

  it("throws CliError for undefined value", () => {
    expect(() => validateRequired("--title", undefined)).toThrow(CliError);
    try {
      validateRequired("--title", undefined);
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).message).toBe("--title must be a non-empty string");
      expect((err as CliError).exitCode).toBe(ExitCode.VALIDATION);
    }
  });

  it("throws CliError for empty string", () => {
    expect(() => validateRequired("--content", "")).toThrow(CliError);
    try {
      validateRequired("--content", "");
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).message).toBe("--content must be a non-empty string");
      expect((err as CliError).exitCode).toBe(ExitCode.VALIDATION);
    }
  });

  it("throws CliError for whitespace-only string", () => {
    expect(() => validateRequired("--id", "   ")).toThrow(CliError);
    try {
      validateRequired("--id", "   ");
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).message).toBe("--id must be a non-empty string");
      expect((err as CliError).exitCode).toBe(ExitCode.VALIDATION);
    }
  });

  it("throws CliError for boolean true (flag with no value)", () => {
    expect(() => validateRequired("--title", true)).toThrow(CliError);
  });
});
