#!/usr/bin/env node

const USAGE = "Usage: noteapi-cli <list|read|create|update|delete> [args...]";

function printUsage(): void {
  process.stderr.write(`${USAGE}\n`);
}

async function runList(_args: string[]): Promise<void> {
  process.stderr.write("list: not yet implemented\n");
  process.exitCode = 1;
}

async function runRead(_args: string[]): Promise<void> {
  process.stderr.write("read: not yet implemented\n");
  process.exitCode = 1;
}

async function runCreate(_args: string[]): Promise<void> {
  process.stderr.write("create: not yet implemented\n");
  process.exitCode = 1;
}

async function runUpdate(_args: string[]): Promise<void> {
  process.stderr.write("update: not yet implemented\n");
  process.exitCode = 1;
}

async function runDelete(_args: string[]): Promise<void> {
  process.stderr.write("delete: not yet implemented\n");
  process.exitCode = 1;
}

export async function main(argv: string[]): Promise<void> {
  const [subcommand, ...rest] = argv;

  if (!subcommand) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  switch (subcommand) {
    case "list":
      await runList(rest);
      return;
    case "read":
      await runRead(rest);
      return;
    case "create":
      await runCreate(rest);
      return;
    case "update":
      await runUpdate(rest);
      return;
    case "delete":
      await runDelete(rest);
      return;
    default:
      process.stderr.write(`Unknown subcommand: ${subcommand}\n`);
      printUsage();
      process.exitCode = 1;
      return;
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  });
}
