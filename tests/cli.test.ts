import { main } from "../src/cli";

describe("CLI main entry point", () => {
  it("should return 0 on successful execution", () => {
    const result = main([]);
    expect(result).toBe(0);
  });
});
