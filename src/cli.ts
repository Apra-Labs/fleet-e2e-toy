export async function run(args: string[]): Promise<number> {
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
