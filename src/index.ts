import app from "./app";
import { runCli } from "./cli";

const cli = runCli(process.argv);
if (cli.handled) {
  process.exit(cli.exitCode);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
