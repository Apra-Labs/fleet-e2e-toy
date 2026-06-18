import { run } from "../src/cli/run";

describe("cli-version", () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;
  let outputs: string[] = [];
  let errors: string[] = [];

  beforeEach(() => {
    outputs = [];
    errors = [];

    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation((str: string | Buffer) => {
      outputs.push(String(str));
      return true;
    });

    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation((str: string | Buffer) => {
      errors.push(String(str));
      return true;
    });
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  test("run(['--version']) returns 0 and prints fleet-e2e-toy v1.0.0", async () => {
    const code = await run(["--version"]);
    expect(code).toBe(0);
    expect(outputs.join("")).toBe("fleet-e2e-toy v1.0.0\n");
  });

  test("run(['-v']) returns 0 and prints fleet-e2e-toy v1.0.0", async () => {
    const code = await run(["-v"]);
    expect(code).toBe(0);
    expect(outputs.join("")).toBe("fleet-e2e-toy v1.0.0\n");
  });

  test("run(['--version', '--json']) returns 0 and prints JSON version", async () => {
    const code = await run(["--version", "--json"]);
    expect(code).toBe(0);
    const output = outputs.join("");
    const parsed = JSON.parse(output);
    expect(parsed).toEqual({
      name: "fleet-e2e-toy",
      version: "1.0.0",
    });
  });

  test("run(['--version', 'notes']) returns 0 and prints version (precedence)", async () => {
    const code = await run(["--version", "notes"]);
    expect(code).toBe(0);
    expect(outputs.join("")).toBe("fleet-e2e-toy v1.0.0\n");
  });
});
