import app from "./app";
import pkg from "../package.json";

const args = process.argv.slice(2);

if (args.includes("--version")) {
  console.log(pkg.version);
  process.exit(0);
}

if (args.includes("--help")) {
  console.log(`Usage: noteapi [options]

Options:
  --version    Print the version and exit
  --help       Show this help message and exit

Environment:
  PORT         Port to listen on (default: 3000)`);
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
