import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// We test the loadConfig function in isolation by mocking fs and os
jest.mock("fs");
jest.mock("os");

import { loadConfig } from "../../src/cli/config";

const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;

const FAKE_HOME = "/fake/home";
const CONFIG_PATH = path.join(FAKE_HOME, ".fleet-e2e-toy.yaml");

beforeEach(() => {
  jest.clearAllMocks();
  mockOs.homedir.mockReturnValue(FAKE_HOME);
});

describe("loadConfig", () => {
  it("returns empty config when config file does not exist", () => {
    mockFs.existsSync.mockReturnValue(false);

    const config = loadConfig();

    expect(config).toEqual({});
  });

  it("parses url key from config file", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("url: http://localhost:3001\n");

    const config = loadConfig();

    expect(config.url).toBe("http://localhost:3001");
  });

  it("ignores comment lines", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("# This is a comment\nurl: http://example.com\n");

    const config = loadConfig();

    expect(config.url).toBe("http://example.com");
  });

  it("warns to stderr for unknown config keys", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("url: http://localhost:3001\nunknown_key: value\n");

    const stderrChunks: string[] = [];
    const origWrite = process.stderr.write.bind(process.stderr);
    process.stderr.write = ((chunk: string) => { stderrChunks.push(chunk); return true; }) as typeof process.stderr.write;

    try {
      loadConfig();
    } finally {
      process.stderr.write = origWrite;
    }

    const stderrOutput = stderrChunks.join("");
    expect(stderrOutput).toContain("unknown config key 'unknown_key'");
  });

  it("does not include unknown keys in the returned config", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("url: http://localhost:3001\nrandom: value\n");

    const origWrite = process.stderr.write.bind(process.stderr);
    process.stderr.write = (() => true) as typeof process.stderr.write;

    let config: ReturnType<typeof loadConfig>;
    try {
      config = loadConfig();
    } finally {
      process.stderr.write = origWrite;
    }

    expect(config).not.toHaveProperty("random");
    expect(Object.keys(config!)).toEqual(["url"]);
  });

  it("returns empty config and warns when file cannot be read", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation(() => { throw new Error("Permission denied"); });

    const stderrChunks: string[] = [];
    const origWrite = process.stderr.write.bind(process.stderr);
    process.stderr.write = ((chunk: string) => { stderrChunks.push(chunk); return true; }) as typeof process.stderr.write;

    let config: ReturnType<typeof loadConfig>;
    try {
      config = loadConfig();
    } finally {
      process.stderr.write = origWrite;
    }

    expect(config).toEqual({});
    expect(stderrChunks.join("")).toContain("could not read config file");
  });

  it("trims whitespace from url value", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("url:   http://localhost:3001   \n");

    const config = loadConfig();

    expect(config.url).toBe("http://localhost:3001");
  });

  it("returns empty config for empty file", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("");

    const config = loadConfig();

    expect(config).toEqual({});
  });

  it("uses correct config file path based on home directory", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("url: http://localhost:3001\n");

    loadConfig();

    expect(mockFs.existsSync).toHaveBeenCalledWith(CONFIG_PATH);
  });
});
