const DISPLAY_NAME = "fleet-e2e-toy";

function getVersion(): string {
  try {
    const pkg = require("../package.json");
    return pkg.version;
  } catch (e) {
    return "unknown";
  }
}

export function main(argv: string[]): number {
  if (argv.length === 0) {
    return 0;
  }

  const firstArg = argv[0];

  if (firstArg === "--version" || firstArg === "-v") {
    console.log(`${DISPLAY_NAME} v${getVersion()}`);
    return 0;
  }

  return 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  process.exit(main(args));
}
