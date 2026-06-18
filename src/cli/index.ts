#!/usr/bin/env node
import { run } from "./run";
import { cleanupAll } from "./tempfiles";
import { createSigintHandler } from "./signals";

process.on(
  "SIGINT",
  createSigintHandler({
    cleanup: cleanupAll,
    write: (s: string) => process.stderr.write(s),
    exit: (code: number) => process.exit(code),
  })
);

run(process.argv.slice(2)).then((code) => process.exit(code));
