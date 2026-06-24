export function parseArgs(args: string[]) {
  const options: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("-")) {
      let cleanArg = arg.startsWith("--") ? arg.slice(2) : arg.slice(1);
      let value: string | boolean = true;

      if (cleanArg.includes("=")) {
        const eqIdx = cleanArg.indexOf("=");
        value = cleanArg.slice(eqIdx + 1);
        cleanArg = cleanArg.slice(0, eqIdx);
        options[cleanArg] = value;
      } else {
        // Look ahead for the value
        if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          value = args[i + 1];
          i++;
        }
        options[cleanArg] = value;
      }
    } else {
      positional.push(arg);
    }
  }

  return {
    command: positional[0],
    positional,
    options,
  };
}
