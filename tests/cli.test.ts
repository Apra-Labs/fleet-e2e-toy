import { handleCliArgs } from '../src/cli';

describe('CLI argument parsing', () => {
  let processExitSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
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

    it('should not exit or print with other flags', () => {
      process.argv = ['node', 'script.js', '--help'];

      handleCliArgs();

      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
