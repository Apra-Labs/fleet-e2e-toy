import * as fs from "fs";

const registry: string[] = [];

export function register(path: string): void {
  registry.push(path);
}

export function cleanupAll(): void {
  for (const path of registry) {
    try {
      fs.rmSync(path, { force: true });
    } catch {
      // best-effort: swallow errors so cleanup never throws
    }
  }
  registry.length = 0;
}

export function list(): string[] {
  return [...registry];
}
