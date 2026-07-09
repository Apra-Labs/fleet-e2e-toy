import * as process from 'process';

const API_BASE = 'http://localhost:3000/api';

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
      flags[key] = val;
      if (val !== 'true') i++; // skip the value
    }
  }
  return flags;
}

export async function runCLI(args: string[]) {
  try {
    for (const arg of args) {
      if (arg.trim() === '') {
        console.error("Error: Empty or whitespace-only arguments are not allowed.");
        process.exit(1);
        return;
      }
    }

    if (args.length === 0) {
      printGlobalHelp();
      process.exit(0);
      return;
    }

    const firstArg = args[0];

    if (firstArg === '--help' || firstArg === '-h') {
      printGlobalHelp();
      process.exit(0);
      return;
    }

    if (firstArg === '--version' || firstArg === '-v') {
      console.log('fleet-e2e-toy v1.0.0');
      process.exit(0);
      return;
    }

    // It's a subcommand
    if (args.includes('--help') || args.includes('-h')) {
      printSubcommandHelp(firstArg);
      process.exit(0);
      return;
    }

    const flags = parseFlags(args.slice(1));

    switch (firstArg) {
      case 'list': {
        const query = new URLSearchParams();
        if (flags.tag) query.append('tag', flags.tag);
        if (flags.q) query.append('q', flags.q);
        const qs = query.toString();
        const res = await fetch(`${API_BASE}/notes${qs ? '?' + qs : ''}`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        console.log(await res.text());
        break;
      }
      case 'read': {
        if (!flags.id) throw new Error('--id is required');
        const res = await fetch(`${API_BASE}/notes/${flags.id}`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        console.log(await res.text());
        break;
      }
      case 'create': {
        if (!flags.title || !flags.content) throw new Error('--title and --content are required');
        const res = await fetch(`${API_BASE}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: flags.title, content: flags.content })
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        console.log(await res.text());
        break;
      }
      case 'update': {
        if (!flags.id) throw new Error('--id is required');
        const body: Record<string, string> = {};
        if (flags.title) body.title = flags.title;
        if (flags.content) body.content = flags.content;
        const res = await fetch(`${API_BASE}/notes/${flags.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        console.log(await res.text());
        break;
      }
      case 'delete': {
        if (!flags.id) throw new Error('--id is required');
        const res = await fetch(`${API_BASE}/notes/${flags.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        console.log(await res.text());
        break;
      }
      default:
        console.error(`Error: Unknown command '${firstArg}'`);
        process.exit(1);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${errorMsg || 'An unexpected error occurred'}`);
    process.exit(1);
  }
}

export function printGlobalHelp() {
  console.log(`Usage: fleet-e2e-toy <command> [options]

Commands:
  list    List all notes
  read    Get a note by ID
  create  Create a note
  update  Update a note
  delete  Delete a note

Options:
  -h, --help     Show help
  -v, --version  Show version`);
}

export function printSubcommandHelp(subcommand: string) {
  console.log(`Usage: fleet-e2e-toy ${subcommand} [options]

Options:
  -h, --help  Show help for ${subcommand}`);
}

if (require.main === module) {
  runCLI(process.argv.slice(2)).catch(() => {});
}
