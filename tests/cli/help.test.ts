import { main } from "../../src/cli/cli";

describe("CLI help system", () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true as any);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true as any);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  describe("global help", () => {
    it("--help prints global help and exits 0", async () => {
      const exitCode = await main(["--help"]);

      expect(exitCode).toBe(0);
      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain("list");
      expect(output).toContain("read");
      expect(output).toContain("create");
      expect(output).toContain("update");
      expect(output).toContain("delete");
    });

    it("-h prints global help and exits 0", async () => {
      const exitCode = await main(["-h"]);

      expect(exitCode).toBe(0);
      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain("list");
      expect(output).toContain("read");
      expect(output).toContain("create");
      expect(output).toContain("update");
      expect(output).toContain("delete");
    });
  });

  describe("per-command help", () => {
    it("create --help prints create command help and exits 0", async () => {
      const exitCode = await main(["create", "--help"]);

      expect(exitCode).toBe(0);
      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain("--title");
      expect(output).toContain("--content");
    });

    it("create -h prints create command help and exits 0", async () => {
      const exitCode = await main(["create", "-h"]);

      expect(exitCode).toBe(0);
      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain("--title");
      expect(output).toContain("--content");
    });
  });
});
