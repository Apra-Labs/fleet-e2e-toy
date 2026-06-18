import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { register, cleanupAll, list } from "../src/cli/tempfiles";

describe("tempfiles registry", () => {
  afterEach(() => {
    // Always reset the registry between tests
    cleanupAll();
  });

  it("register then list returns the registered path", () => {
    const p = path.join(os.tmpdir(), `fleet-test-${Date.now()}.txt`);
    register(p);
    expect(list()).toContain(p);
  });

  it("list returns a copy (mutation does not affect registry)", () => {
    const p = path.join(os.tmpdir(), `fleet-test-${Date.now()}.txt`);
    register(p);
    const snapshot = list();
    snapshot.push("/fake/path");
    expect(list()).toHaveLength(1);
  });

  it("cleanupAll deletes a real temp file and empties the list", () => {
    const p = path.join(os.tmpdir(), `fleet-test-${Date.now()}.txt`);
    fs.writeFileSync(p, "test content");
    expect(fs.existsSync(p)).toBe(true);
    register(p);
    cleanupAll();
    expect(fs.existsSync(p)).toBe(false);
    expect(list()).toHaveLength(0);
  });

  it("cleanupAll on a non-existent path does not throw", () => {
    const p = path.join(os.tmpdir(), `fleet-test-nonexistent-${Date.now()}.txt`);
    register(p);
    expect(() => cleanupAll()).not.toThrow();
    expect(list()).toHaveLength(0);
  });
});
