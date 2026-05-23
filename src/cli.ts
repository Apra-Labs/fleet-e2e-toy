const args = process.argv.slice(2);

// Check if any argument is empty or blank
if (args.some(arg => arg.trim() === '')) {
  console.error("Error: Arguments cannot be empty or blank strings.");
  process.exit(1);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

