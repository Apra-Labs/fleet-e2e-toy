const args = process.argv.slice(2);
for (const arg of args) {
  if (arg.trim() === '') {
    console.error('Error: Invalid argument. Arguments cannot be empty or whitespace-only.');
    process.exit(1);
  }
}

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log('fleet-e2e-toy v1.0.0');
  process.exit(0);
}

const helpMessage = `Usage: fleet-e2e-toy [command] [options]

Commands:
  help               Display help information

Options:
  -v, --version      Display version information
  -h, --help         Display help information`;

if (process.argv.includes('help') || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(helpMessage);
  process.exit(0);
}

import app from "./app";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`NoteAPI running on http://localhost:${PORT}`);
});
