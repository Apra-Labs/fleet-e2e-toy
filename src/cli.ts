export function main(argv: string[]): number {
  if (argv.includes("-v") || argv.includes("--version")) {
    console.log("fleet-e2e-toy v1.0.0");
    return 0;
  }
  return 0;
}

if (require.main === module) {
  const exitCode = main(process.argv.slice(2));
  process.exit(exitCode);
}
