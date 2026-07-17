#!/usr/bin/env node

import { createNote, deleteNote, getNote, listNotes, updateNote } from "./client";
import { parseFlags } from "./args";
import { Note } from "../models/note";

const USAGE = "Usage: noteapi-cli <list|read|create|update|delete> [args...]";

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
  const flags = parseFlags(args);

  try {
    const notes = await listNotes({ tag: flags.tag, q: flags.q });
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
  const flags = parseFlags(args);
  const id = flags.id;

  if (!id) {
    process.stderr.write("Error: --id is required\n");
    process.exitCode = 1;
    return;
  }

  try {
    const note = await getNote(id);
    printNoteFull(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

async function runCreate(args: string[]): Promise<void> {
  const flags = parseFlags(args);

  if (!flags.title) {
    process.stderr.write("Error: --title is required\n");
    process.exitCode = 1;
    return;
  }
  if (flags.content === undefined) {
    process.stderr.write("Error: --content is required\n");
    process.exitCode = 1;
    return;
  }

  try {
    const note = await createNote({ title: flags.title, content: flags.content, tags: [] });
    printNoteFull(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

async function runUpdate(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const id = flags.id;

  if (!id) {
    process.stderr.write("Error: --id is required\n");
    process.exitCode = 1;
    return;
  }

  const updates: { title?: string; content?: string } = {};
  if (flags.title !== undefined) updates.title = flags.title;
  if (flags.content !== undefined) updates.content = flags.content;

  try {
    const note = await updateNote(id, updates);
    printNoteFull(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}

async function runDelete(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const id = flags.id;

  if (!id) {
    process.stderr.write("Error: --id is required\n");
    process.exitCode = 1;
    return;
  }

  try {
    await deleteNote(id);
    process.stdout.write(`Deleted note ${id}\n`);
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
