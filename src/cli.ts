export async function run(args: string[]): Promise<number> {
  if (args.includes('--version') || args.includes('-v')) {
    console.log("fleet-e2e-toy v1.0.0");
    return 0;
  }
  console.log("CLI running with args:", args);
  return 0;
}

if (require.main === module) {
  run(process.argv.slice(2)).then((code) => {
    process.exit(code);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
