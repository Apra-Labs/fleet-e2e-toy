import app from "./app";
import { runCLI } from "./cli";

const args = process.argv.slice(2);

if (args.length > 0) {
  runCLI(args);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
