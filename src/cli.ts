export function main(args: string[]): void {
  const isHelp = args.includes("help") || args.includes("--help") || args.includes("-h");
  if (isHelp) {
    console.log("Usage: tool [options] [command]");
    console.log("");
    console.log("Options:");
    console.log("  -v, --version  Show version information");
    console.log("  -h, --help     Show help information");
    console.log("");
    console.log("Commands:");
    console.log("  help           Show help information");
    process.exit(0);
  }

  const isVersion = args.includes("--version") || args.includes("-v");
  if (isVersion) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

