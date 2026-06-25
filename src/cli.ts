// CLI interface for NoteAPI

export interface CliIO {
  out?: (s: string) => void;
  err?: (s: string) => void;
}

export interface ParsedArgs {
  command?: string;
  positional: string[];
  flags: Record<string, string | boolean>;
  helpRequested: boolean;
  versionRequested: boolean;
}

export class CliError extends Error {
  code = 1;
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}

// Known flags per command (used for validation)
const KNOWN_FLAGS: Record<string, Set<string>> = {
  create: new Set(["title", "content", "tags", "help"]),
  list: new Set(["tag", "search", "help"]),
  get: new Set(["help"]),
  update: new Set(["title", "content", "tags", "help"]),
  delete: new Set(["help"]),
  "": new Set(["help", "version"]), // root (no command)
};

export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: undefined,
    positional: [],
    flags: {},
    helpRequested: false,
    versionRequested: false,
  };

  let i = 0;

  // First non-flag token is the command
  while (i < argv.length) {
    const token = argv[i];
    if (token === "-h" || token === "--help") {
      result.helpRequested = true;
      result.flags["help"] = true;
      i++;
    } else if (token === "-V" || token === "--version") {
      result.versionRequested = true;
      result.flags["version"] = true;
      i++;
    } else if (token.startsWith("--")) {
      // Flag before command — check if it has = in it
      if (token.includes("=")) {
        const eqIdx = token.indexOf("=");
        const flagName = token.slice(2, eqIdx);
        const flagValue = token.slice(eqIdx + 1);
        // Validate against root flags
        const knownRoot = KNOWN_FLAGS[""];
        if (!knownRoot.has(flagName)) {
          throw new CliError(`Error: Unknown flag: --${flagName}`);
        }
        result.flags[flagName] = flagValue;
        i++;
      } else {
        const flagName = token.slice(2);
        const knownRoot = KNOWN_FLAGS[""];
        if (!knownRoot.has(flagName)) {
          throw new CliError(`Error: Unknown flag: --${flagName}`);
        }
        // Check next token for value
        if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
          result.flags[flagName] = argv[i + 1];
          i += 2;
        } else {
          throw new CliError(`Error: Missing value for flag: --${flagName}`);
        }
      }
    } else if (token.startsWith("-")) {
      throw new CliError(`Error: Unknown flag: ${token}`);
    } else {
      // This is the command
      result.command = token;
      i++;
      break;
    }
  }

  // Parse remaining tokens after command
  const cmd = result.command ?? "";
  const knownForCmd = KNOWN_FLAGS[cmd] ?? new Set<string>();

  while (i < argv.length) {
    const token = argv[i];
    if (token === "-h" || token === "--help") {
      result.helpRequested = true;
      result.flags["help"] = true;
      i++;
    } else if (token === "-V" || token === "--version") {
      result.versionRequested = true;
      result.flags["version"] = true;
      i++;
    } else if (token.startsWith("--")) {
      if (token.includes("=")) {
        const eqIdx = token.indexOf("=");
        const flagName = token.slice(2, eqIdx);
        const flagValue = token.slice(eqIdx + 1);
        if (!knownForCmd.has(flagName)) {
          throw new CliError(`Error: Unknown flag: --${flagName}`);
        }
        result.flags[flagName] = flagValue;
        i++;
      } else {
        const flagName = token.slice(2);
        if (!knownForCmd.has(flagName)) {
          throw new CliError(`Error: Unknown flag: --${flagName}`);
        }
        if (i + 1 >= argv.length || argv[i + 1].startsWith("-")) {
          throw new CliError(`Error: Missing value for flag: --${flagName}`);
        }
        result.flags[flagName] = argv[i + 1];
        i += 2;
      }
    } else if (token.startsWith("-")) {
      throw new CliError(`Error: Unknown flag: ${token}`);
    } else {
      // Positional arg
      result.positional.push(token);
      i++;
    }
  }

  return result;
}

export async function run(argv: string[], io?: CliIO): Promise<number> {
  const out = io?.out ?? ((s: string) => process.stdout.write(s));
  const err = io?.err ?? ((s: string) => process.stderr.write(s));

  // Suppress unused-vars warning — out is used in Phase 3 (help, version)
  void out;

  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(argv);
  } catch (e) {
    if (e instanceof CliError) {
      err(e.message + "\n");
      return e.code;
    }
    throw e;
  }

  // Handle --help early (before command dispatch)
  if (parsed.helpRequested) {
    // TODO: Phase 3 fills in full help text
    return 0;
  }

  // Handle --version early (before command dispatch)
  if (parsed.versionRequested) {
    // TODO: Phase 3 fills in version output
    return 0;
  }

  // Dispatch on command
  switch (parsed.command) {
    case "create":
      throw new Error("not implemented");
    case "list":
      throw new Error("not implemented");
    case "get":
      throw new Error("not implemented");
    case "update":
      throw new Error("not implemented");
    case "delete":
      throw new Error("not implemented");
    default:
      if (!parsed.command) {
        // No command — treat as root help stub
        // TODO: Phase 3 fills in full help text
        return 0;
      }
      err(`Error: Unknown command: ${parsed.command}\n`);
      return 1;
  }
}

if (require.main === module) {
  run(process.argv.slice(2)).then((code) => process.exit(code));
}
