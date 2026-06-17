import { execSync } from 'child_process';
import path from 'path';

const CLI_PATH = path.join(__dirname, '..', 'src', 'cli.ts');

describe('CLI', () => {
  describe('--version flag', () => {
    it('should print version with --version', () => {
      const output = execSync(`ts-node ${CLI_PATH} --version`, {
        encoding: 'utf-8',
      });
      expect(output.trim()).toBe('fleet-e2e-toy v1.0.0');
    });

    it('should print version with -v alias', () => {
      const output = execSync(`ts-node ${CLI_PATH} -v`, {
        encoding: 'utf-8',
      });
      expect(output.trim()).toBe('fleet-e2e-toy v1.0.0');
    });

    it('should exit with code 0', () => {
      const result = execSync(`ts-node ${CLI_PATH} --version`, {
        encoding: 'utf-8',
      });
      expect(result).toBeDefined();
    });
  });

  describe('--help flag', () => {
    it('should show help with --help', () => {
      const output = execSync(`ts-node ${CLI_PATH} --help`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('Usage:');
      expect(output).toContain('Commands:');
      expect(output).toContain('list');
      expect(output).toContain('read');
      expect(output).toContain('create');
      expect(output).toContain('update');
      expect(output).toContain('delete');
    });

    it('should show help with -h alias', () => {
      const output = execSync(`ts-node ${CLI_PATH} -h`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('Usage:');
    });
  });

  describe('command structure', () => {
    it('should have list command with --region option', () => {
      const output = execSync(`ts-node ${CLI_PATH} list --help`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('region');
    });

    it('should have read command with --id option', () => {
      const output = execSync(`ts-node ${CLI_PATH} read --help`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('id');
    });

    it('should have create command with --title and --content options', () => {
      const output = execSync(`ts-node ${CLI_PATH} create --help`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('title');
      expect(output).toContain('content');
    });

    it('should have update command with --id, --title, and --content options', () => {
      const output = execSync(`ts-node ${CLI_PATH} update --help`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('id');
      expect(output).toContain('title');
      expect(output).toContain('content');
    });

    it('should have delete command with --id option', () => {
      const output = execSync(`ts-node ${CLI_PATH} delete --help`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('id');
    });
  });
});
