import app from "./app";
import { handleCliArgs } from "./cli";

const PORT = process.env.PORT ?? 3000;

handleCliArgs();

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
