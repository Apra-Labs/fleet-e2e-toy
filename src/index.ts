import app from "./app";
import { version } from "../package.json";

const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  console.log(`fleet-e2e-toy v${version}`);
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
