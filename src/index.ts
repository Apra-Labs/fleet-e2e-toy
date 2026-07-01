import app from "./app";
import { isVersionFlag, VERSION_STRING } from "./utils/cli";

if (isVersionFlag(process.argv.slice(2))) {
  console.log(VERSION_STRING);
  process.exit(0);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
