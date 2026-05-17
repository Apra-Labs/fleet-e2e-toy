import { execSync } from 'child_process';

const tool = 'npx ts-node src/cli.ts';

describe('CLI', () => {
  it('should print version with --version', () => {
    const output = execSync(`${tool} --version`).toString();
    expect(output).toContain('fleet-e2e-toy v1.0.0');
  });

  it('should print help with --help', () => {
    const output = execSync(`${tool} --help`).toString();
    expect(output).toContain('Commands:');
    expect(output).toContain('tool add');
  });

  it('should print help with help subcommand', () => {
    const output = execSync(`${tool} help`).toString();
    expect(output).toContain('Commands:');
    expect(output).toContain('tool add');
  });

  it('should add a note with valid title', () => {
    const output = execSync(`${tool} add "Test Note"`).toString();
    expect(output).toContain('Added note: Test Note');
  });

  it('should fail with empty title', () => {
    try {
      execSync(`${tool} add ""`, { stdio: 'pipe' });
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.status).toBeDefined();
      expect(error.status).not.toBe(0);
      expect(error.stderr.toString()).toContain('Error: title cannot be blank');
    }
  });

  it('should fail with whitespace title', () => {
    try {
      execSync(`${tool} add "   "`, { stdio: 'pipe' });
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.status).toBeDefined();
      expect(error.status).not.toBe(0);
      expect(error.stderr.toString()).toContain('Error: title cannot be blank');
    }
  });
});
