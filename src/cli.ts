import fs from 'fs';
import path from 'path';

function readVersion(): string {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.version;
}

export function handleCliArgs(): void {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    const version = readVersion();
    console.log(`fleet-e2e-toy v${version}`);
    process.exit(0);
  }
}
