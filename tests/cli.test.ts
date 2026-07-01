import { isVersionFlag, VERSION_STRING } from "../src/utils/cli";

describe("isVersionFlag", () => {
  it("detects --version", () => {
    expect(isVersionFlag(["--version"])).toBe(true);
  });

  it("detects -v shorthand", () => {
    expect(isVersionFlag(["-v"])).toBe(true);
  });

  it("detects the flag alongside other args", () => {
    expect(isVersionFlag(["--port", "3000", "--version"])).toBe(true);
    expect(isVersionFlag(["-v", "--port", "3000"])).toBe(true);
  });

  it("returns false when the flag is absent", () => {
    expect(isVersionFlag([])).toBe(false);
    expect(isVersionFlag(["--port", "3000"])).toBe(false);
  });

  it("exposes the expected version string", () => {
    expect(VERSION_STRING).toBe("fleet-e2e-toy v1.0.0");
  });
});
