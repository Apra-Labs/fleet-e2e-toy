import app from "./app";
import { version } from "../package.json";

const PORT = process.env.PORT ?? 3000;

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(`fleet-e2e-toy v${version}`);
  process.exit(0);
}

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
