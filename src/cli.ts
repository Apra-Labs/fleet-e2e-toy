export function main(args: string[]): void {
  const isVersion = args.includes("--version") || args.includes("-v");
  if (isVersion) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}
