import { readFileSync } from "fs";
import { resolve } from "path";

import app from "./app";

// Resolve package.json relative to this source file's directory
const srcDir = __dirname as string;
const pkgPath = resolve(srcDir, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { version: string };

// Check for version flags before starting the server
const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  console.log(`fleet-e2e-toy v${pkg.version}`);
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
