import fs from 'fs';
import path from 'path';

function readVersion(): string {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.version;
}

function getHelpText(): string {
  return `REST API for managing notes with tags and search — demo project for Agentic AI Workshop (Advanced)

Commands:
  help                        Show this help message

Flags:
  --version, -v               Show version
  --help, -h                  Show this help message`;
}

export function handleCliArgs(): void {
  const args = process.argv.slice(2);

  if (args[0] === 'help' || args.includes('--help') || args.includes('-h')) {
    console.log(getHelpText());
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    const version = readVersion();
    console.log(`fleet-e2e-toy v${version}`);
    process.exit(0);
  }
}
