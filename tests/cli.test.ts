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
});
