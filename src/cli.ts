export function main(_argv: string[]): number {
  return 0;
}

if (require.main === module) {
  const exitCode = main(process.argv.slice(2));
  process.exit(exitCode);
}
