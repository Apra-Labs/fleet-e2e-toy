import app from "./app";

const args = process.argv.slice(2);
const isCli = process.env.RUNNING_AS_CLI === "true" || args.length > 0;

if (isCli) {
  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }
  process.exit(0);
} else {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`NoteAPI running on http://localhost:${PORT}`);
  });
}

