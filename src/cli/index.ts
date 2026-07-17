#!/usr/bin/env node

import { createNote, deleteNote, getNote, listNotes, updateNote } from "./client";
import { parseFlags } from "./args";
import { Note } from "../models/note";
import { isHelpFlag, printGlobalHelp, printSubcommandHelp } from "./help";
import { validateOptionalFlag, validateRequiredFlag } from "./validation";
import * as fs from "fs";
import * as path from "path";

const USAGE = "Usage: noteapi-cli <list|read|create|update|delete> [args...]";

function getVersion(): string {
  try {
    const packagePath = path.join(__dirname, "../..", "package.json");
    const packageData = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    return packageData.version;
  } catch {
    return "unknown";
  }
}

function printVersion(): void {
  const version = getVersion();
  process.stdout.write(`noteapi v${version}\n`);
}

function printUsage(): void {
  process.stderr.write(`${USAGE}\n`);
}

function printNoteSummary(note: Note): void {
  process.stdout.write(`${note.id}\t${note.title}\n`);
}

function printNoteFull(note: Note): void {
  process.stdout.write(`${JSON.stringify(note, null, 2)}\n`);
}

async function runList(args: string[]): Promise<void> {
  if (isHelpFlag(args)) {
    printSubcommandHelp("list");
    return;
  }

  const flags = parseFlags(args);

  const tagResult = validateOptionalFlag("tag", flags.tag);
  if (!tagResult.valid) {
    process.stderr.write(`Error: ${tagResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  const qResult = validateOptionalFlag("q", flags.q);
  if (!qResult.valid) {
    process.stderr.write(`Error: ${qResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  try {
    const notes = await listNotes({
      tag: tagResult.value || undefined,
      q: qResult.value || undefined,
    });
    for (const note of notes) {
      printNoteSummary(note);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

async function runRead(args: string[]): Promise<void> {
  if (isHelpFlag(args)) {
    printSubcommandHelp("read");
    return;
  }

  const flags = parseFlags(args);
  const idResult = validateRequiredFlag("id", flags.id);

  if (!idResult.valid) {
    process.stderr.write(`Error: ${idResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  try {
    const note = await getNote(idResult.value);
    printNoteFull(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

async function runCreate(args: string[]): Promise<void> {
  if (isHelpFlag(args)) {
    printSubcommandHelp("create");
    return;
  }

  const flags = parseFlags(args);

  const titleResult = validateRequiredFlag("title", flags.title);
  if (!titleResult.valid) {
    process.stderr.write(`Error: ${titleResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  const contentResult = validateRequiredFlag("content", flags.content);
  if (!contentResult.valid) {
    process.stderr.write(`Error: ${contentResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  try {
    const note = await createNote({ title: titleResult.value, content: contentResult.value, tags: [] });
    printNoteFull(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

async function runUpdate(args: string[]): Promise<void> {
  if (isHelpFlag(args)) {
    printSubcommandHelp("update");
    return;
  }

  const flags = parseFlags(args);
  const idResult = validateRequiredFlag("id", flags.id);

  if (!idResult.valid) {
    process.stderr.write(`Error: ${idResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  const titleResult = validateOptionalFlag("title", flags.title);
  if (!titleResult.valid) {
    process.stderr.write(`Error: ${titleResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  const contentResult = validateOptionalFlag("content", flags.content);
  if (!contentResult.valid) {
    process.stderr.write(`Error: ${contentResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  const updates: { title?: string; content?: string } = {};
  if (flags.title !== undefined) updates.title = titleResult.value;
  if (flags.content !== undefined) updates.content = contentResult.value;

  try {
    const note = await updateNote(idResult.value, updates);
    printNoteFull(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

async function runDelete(args: string[]): Promise<void> {
  if (isHelpFlag(args)) {
    printSubcommandHelp("delete");
    return;
  }

  const flags = parseFlags(args);
  const idResult = validateRequiredFlag("id", flags.id);

  if (!idResult.valid) {
    process.stderr.write(`Error: ${idResult.error}\n`);
    process.exitCode = 1;
    return;
  }

  try {
    await deleteNote(idResult.value);
    process.stdout.write(`Deleted note ${idResult.value}\n`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

export async function main(argv: string[]): Promise<void> {
  const [subcommand, ...rest] = argv;

  if (!subcommand) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (subcommand === "--version" || subcommand === "-v") {
    printVersion();
    return;
  }

  if (subcommand === "--help" || subcommand === "-h") {
    printGlobalHelp();
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
