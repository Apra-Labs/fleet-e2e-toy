import app from "./app";
import { getVersionString, hasVersionFlag } from "./cli";

if (hasVersionFlag(process.argv.slice(2))) {
  console.log(getVersionString());
  process.exit(0);
} else {
  const PORT = process.env.PORT ?? 3000;

  app.listen(PORT, () => {
    console.log(`NoteAPI running on http://localhost:${PORT}`);
  });
}
