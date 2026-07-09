import { runCLI } from '../src/cli';

describe('CLI framework', () => {
  let exitSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock fetch to prevent actual network calls during simple CLI tests
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('success')
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prints global help and exits with code 0 on --help', async () => {
    await runCLI(['--help']);
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0]).toContain('Usage: fleet-e2e-toy <command>');
  });

  it('prints version and exits with code 0 on --version', async () => {
    await runCLI(['--version']);
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(logSpy).toHaveBeenCalledWith('fleet-e2e-toy v1.0.0');
  });

  it('prints version and exits with code 0 on -v', async () => {
    await runCLI(['-v']);
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(logSpy).toHaveBeenCalledWith('fleet-e2e-toy v1.0.0');
  });

  it('prints global help and exits with code 0 on no args', async () => {
    await runCLI([]);
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(logSpy).toHaveBeenCalled();
  });

  it('prints subcommand help and exits with code 0 on [cmd] --help', async () => {
    await runCLI(['list', '--help']);
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0]).toContain('Usage: fleet-e2e-toy list');
  });

  it('rejects empty/whitespace arguments with code 1', async () => {
    await runCLI(['list', '   ']);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain('Empty or whitespace-only arguments');
  });

  it('exits with code 1 for unknown commands', async () => {
    await runCLI(['unknown-cmd']);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain("Unknown command 'unknown-cmd'");
  });
});
