import { handleCliArgs } from '../src/cli';

describe('CLI argument parsing', () => {
  let processExitSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('--version flag', () => {
    it('should print version and exit with code 0 when --version is passed', () => {
      process.argv = ['node', 'script.js', '--version'];

      expect(() => handleCliArgs()).toThrow('process.exit(0)');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/^fleet-e2e-toy v\d+\.\d+\.\d+$/));
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should print version and exit with code 0 when -v is passed', () => {
      process.argv = ['node', 'script.js', '-v'];

      expect(() => handleCliArgs()).toThrow('process.exit(0)');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/^fleet-e2e-toy v\d+\.\d+\.\d+$/));
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should not exit or print when no version flag is passed', () => {
      process.argv = ['node', 'script.js'];

      handleCliArgs();

      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('help command and flags', () => {
    it('should print help text and exit with code 0 when help subcommand is passed', () => {
      process.argv = ['node', 'script.js', 'help'];

      expect(() => handleCliArgs()).toThrow('process.exit(0)');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Commands:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Flags:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('--version'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('--help'));
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should print help text and exit with code 0 when --help is passed', () => {
      process.argv = ['node', 'script.js', '--help'];

      expect(() => handleCliArgs()).toThrow('process.exit(0)');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Commands:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Flags:'));
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should print help text and exit with code 0 when -h is passed', () => {
      process.argv = ['node', 'script.js', '-h'];

      expect(() => handleCliArgs()).toThrow('process.exit(0)');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Commands:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Flags:'));
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should show help for all supported commands in usage text', () => {
      process.argv = ['node', 'script.js', 'help'];

      expect(() => handleCliArgs()).toThrow('process.exit(0)');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('help'));
    });
  });

  describe('input validation for string arguments', () => {
    it('should print error and exit with code 1 for empty string argument', () => {
      process.argv = ['node', 'script.js', ''];

      expect(() => handleCliArgs()).toThrow('process.exit(1)');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('empty'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should print error and exit with code 1 for whitespace-only argument', () => {
      process.argv = ['node', 'script.js', '   '];

      expect(() => handleCliArgs()).toThrow('process.exit(1)');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('empty'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should not exit for valid non-blank argument', () => {
      process.argv = ['node', 'script.js', 'valid-arg'];

      handleCliArgs();

      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not validate arguments that start with dash (flags)', () => {
      process.argv = ['node', 'script.js', '--flag'];

      handleCliArgs();

      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should validate multiple positional arguments and fail on first invalid one', () => {
      process.argv = ['node', 'script.js', 'valid', ''];

      expect(() => handleCliArgs()).toThrow('process.exit(1)');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('empty'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
