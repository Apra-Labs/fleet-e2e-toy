const API_URL = process.env.API_URL || 'http://localhost:3000/api/notes';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const parsedArgs: Record<string, string> = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        parsedArgs[key] = value;
        i++;
      } else {
        parsedArgs[key] = 'true';
      }
    }
  }

  if (command === 'create') {
    const title = parsedArgs.title;
    const content = parsedArgs.content;
    if (!title || !content) {
      console.error('Error: --title and --content are required for create.');
      process.exit(1);
    }
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, tags: [] })
    });
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      process.exit(1);
    }
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    
  } else if (command === 'update') {
    const id = parsedArgs.id;
    if (!id) {
      console.error('Error: --id is required for update.');
      process.exit(1);
    }
    const body: Record<string, string> = {};
    if (parsedArgs.title) body.title = parsedArgs.title;
    if (parsedArgs.content) body.content = parsedArgs.content;
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      process.exit(1);
    }
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

  } else if (command === 'delete') {
    const id = parsedArgs.id;
    if (!id) {
      console.error('Error: --id is required for delete.');
      process.exit(1);
    }
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      process.exit(1);
    }
    // Delete might return 204 No Content
    if (response.status !== 204) {
        try {
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));
        } catch {
            console.log(`Deleted note ${id}`);
        }
    } else {
        console.log(`Deleted note ${id}`);
    }
  } else if (command === 'list') {
    const url = new URL(API_URL);
    if (parsedArgs.tag) url.searchParams.append('tag', parsedArgs.tag);
    if (parsedArgs.q) url.searchParams.append('q', parsedArgs.q);
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      process.exit(1);
    }
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    
  } else if (command === 'read') {
    const id = parsedArgs.id;
    if (!id) {
      console.error('Error: --id is required for read.');
      process.exit(1);
    }
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      process.exit(1);
    }
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    
  } else if (command) {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
