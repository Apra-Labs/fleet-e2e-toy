import { execSync } from 'child_process';
import path from 'path';

const tsNode = path.resolve(__dirname, '../node_modules/.bin/ts-node');
const entryPoint = path.resolve(__dirname, '../src/index.ts');

describe('CLI --version', () => {
  it('prints the correct version and exits 0', () => {
    const output = execSync(`\"${tsNode}\" \"${entryPoint}\" --version`, { encoding: 'utf8', env: { ...process.env, PORT: '0' } });
    expect(output.trim()).toBe('fleet-e2e-toy v1.0.0');
  });

  it('prints the correct version with -v and exits 0', () => {
    const output = execSync(`\"${tsNode}\" \"${entryPoint}\" -v`, { encoding: 'utf8', env: { ...process.env, PORT: '0' } });
    expect(output.trim()).toBe('fleet-e2e-toy v1.0.0');
  });
});