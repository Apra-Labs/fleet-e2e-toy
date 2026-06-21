import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Supported config keys in ~/.fleet-e2e-toy.yaml
 */
export interface CliConfig {
  /** Base URL for the NoteAPI (overrides NOTEAPI_URL env var default). */
  url?: string;
}

const SUPPORTED_KEYS: Set<string> = new Set(["url"]);
const CONFIG_FILE = ".fleet-e2e-toy.yaml";

/**
 * Load configuration from ~/.fleet-e2e-toy.yaml.
 * Returns an empty config object if the file does not exist.
 * Warns to stderr on unknown keys.
 * Does not throw on missing or malformed files — logs a warning instead.
 */
export function loadConfig(): CliConfig {
  const configPath = path.join(os.homedir(), CONFIG_FILE);

  if (!fs.existsSync(configPath)) {
    return {};
  }

  let raw: string;
  try {
    raw = fs.readFileSync(configPath, "utf-8");
  } catch {
    process.stderr.write(`Warning: could not read config file at ${configPath}\n`);
    return {};
  }

  // Parse the YAML using a simple manual parser to avoid adding a heavy
  // dependency. We only support top-level scalar key: value pairs.
  let parsed: Record<string, unknown>;
  try {
    parsed = parseSimpleYaml(raw);
  } catch {
    process.stderr.write(`Warning: could not parse config file at ${configPath} — using defaults\n`);
    return {};
  }

  const config: CliConfig = {};

  for (const key of Object.keys(parsed)) {
    if (!SUPPORTED_KEYS.has(key)) {
      process.stderr.write(`Warning: unknown config key '${key}' in ${configPath} — ignoring\n`);
      continue;
    }

    const value = parsed[key];

    if (key === "url" && typeof value === "string") {
      config.url = value.trim();
    }
  }

  return config;
}

/**
 * Parse a simple YAML file containing only top-level "key: value" lines.
 * Lines starting with # are treated as comments and skipped.
 * Does not handle nested structures, lists, or multi-line values.
 */
function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (key) {
      result[key] = value;
    }
  }

  return result;
}
