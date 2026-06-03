import { execSync } from "child_process";
import path from "path";

const TOOL_PATH = path.resolve(__dirname, "../tool");

describe("CLI Wrapper and Version Flag", () => {
  it("prints version with --version flag", () => {
    const stdout = execSync(`"${TOOL_PATH}" --version`, { encoding: "utf8" });
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version with -v flag", () => {
    const stdout = execSync(`"${TOOL_PATH}" -v`, { encoding: "utf8" });
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version when mixed with other flags", () => {
    const stdout1 = execSync(`"${TOOL_PATH}" --version --foo`, { encoding: "utf8" });
    expect(stdout1.trim()).toBe("fleet-e2e-toy v1.0.0");

    const stdout2 = execSync(`"${TOOL_PATH}" --foo -v`, { encoding: "utf8" });
    expect(stdout2.trim()).toBe("fleet-e2e-toy v1.0.0");
  });
});
