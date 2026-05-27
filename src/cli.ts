async function main() {
  const args = process.argv.slice(2);
  console.log("CLI args:", args);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
