import { main } from "../src/cli";

describe("CLI", () => {
  describe("--version flag", () => {
    it("should return 0 and print version on --version", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const result = main(["--version"]);
      expect(result).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
      consoleLogSpy.mockRestore();
    });

    it("should return 0 and print version on -v", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const result = main(["-v"]);
      expect(result).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
      consoleLogSpy.mockRestore();
    });
  });

  describe("help command and flags", () => {
    it("should return 0 and print help for 'help' subcommand", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const result = main(["help"]);
      expect(result).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("help");
      expect(output).toContain("--version");
      expect(output).toContain("--help");
      consoleLogSpy.mockRestore();
    });

    it("should return 0 and print help on --help flag", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const result = main(["--help"]);
      expect(result).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("help");
      expect(output).toContain("--version");
      expect(output).toContain("--help");
      consoleLogSpy.mockRestore();
    });

    it("should return 0 and print help on -h flag", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const result = main(["-h"]);
      expect(result).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("help");
      expect(output).toContain("--version");
      expect(output).toContain("--help");
      consoleLogSpy.mockRestore();
    });
  });
});
