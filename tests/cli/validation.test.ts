import { validateRequiredString, validateOptionalString } from "../../src/cli/validation";

describe("validateRequiredString", () => {
  it("throws when value is empty string", () => {
    expect(() => validateRequiredString("", "title")).toThrow("--title");
  });

  it("throws when value is whitespace-only", () => {
    expect(() => validateRequiredString("   ", "content")).toThrow("--content");
  });

  it("throws and includes the flag name in the message", () => {
    expect(() => validateRequiredString("", "myflag")).toThrow("--myflag");
  });

  it("does not throw for a valid non-empty string", () => {
    expect(() => validateRequiredString("hello", "title")).not.toThrow();
  });
});

describe("validateOptionalString", () => {
  it("throws when value is empty string", () => {
    expect(() => validateOptionalString("", "title")).toThrow("--title");
  });

  it("throws when value is whitespace-only", () => {
    expect(() => validateOptionalString("   ", "content")).toThrow("--content");
  });

  it("does not throw when value is undefined", () => {
    expect(() => validateOptionalString(undefined, "title")).not.toThrow();
  });

  it("does not throw for a valid non-empty string", () => {
    expect(() => validateOptionalString("hello", "title")).not.toThrow();
  });
});
