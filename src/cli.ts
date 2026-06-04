import * as fs from "fs";
import * as path from "path";

export function runCli(args: string[]): { exitCode: number; output: string; errorOutput: string } {
  let output = "";
  const errorOutput = "";

  const log = (msg: string) => {
    output += msg + "\n";
    console.log(msg);
  };

  // Read package.json version
  let version = "1.0.0";
  try {
    const pkgPath = path.resolve(__dirname, "../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    version = pkg.version || "1.0.0";
  } catch (err) {
    // fallback
  }

  // Version check should take precedence or work alongside other flags.
  if (args.includes("--version") || args.includes("-v")) {
    log(`fleet-e2e-toy v${version}`);
    return { exitCode: 0, output, errorOutput };
  }

  // Help check: detect help subcommand or --help/-h flags.
  if (args.includes("help") || args.includes("--help") || args.includes("-h")) {
    log("Usage: fleet-e2e-toy [command] [options]");
    log("");
    log("Commands:");
    log("  help           Display usage information");
    log("");
    log("Options:");
    log("  -h, --help     Display usage information");
    log("  -v, --version  Display version information");
    return { exitCode: 0, output, errorOutput };
  }

  return { exitCode: 0, output, errorOutput };
}

if (require.main === module) {
  const result = runCli(process.argv.slice(2));
  process.exit(result.exitCode);
}
