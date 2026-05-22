import * as process from "process";

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }

  if (args.includes("help") || args.includes("--help") || args.includes("-h")) {
    console.log("Usage: fleet-e2e-toy [command] [options]\n\n" +
                "Commands:\n" +
                "  help             Show this help message\n\n" +
                "Options:\n" +
                "  --version, -v    Show version information\n" +
                "  --help, -h       Show this help message");
    process.exit(0);
  }
}

main();
