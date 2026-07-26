import app from "./app";

const PORT = process.env.PORT ?? 3000;

export function run(argv: string[]): void {
  if (argv.includes("--version") || argv.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    return;
  }

  app.listen(PORT, () => {
    console.log(`NoteAPI running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  run(process.argv.slice(2));
}
