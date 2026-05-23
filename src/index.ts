if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log('fleet-e2e-toy v1.0.0');
  process.exit(0);
}

import app from "./app";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
