import { execSync } from "child_process";
import path from "path";

describe("--version and -v flags", () => {
  it("prints noteapi v1.0.0 with --version flag", () => {
    const output = execSync(
      "npx ts-node src/index.ts --version",
      {
        cwd: path.resolve(__dirname, ".."),
        encoding: "utf-8",
      }
    );

    expect(output).toContain("noteapi v1.0.0");
  });

  it("prints noteapi v1.0.0 with -v alias", () => {
    const output = execSync(
      "npx ts-node src/index.ts -v",
      {
        cwd: path.resolve(__dirname, ".."),
        encoding: "utf-8",
      }
    );

    expect(output).toContain("noteapi v1.0.0");
  });
});
