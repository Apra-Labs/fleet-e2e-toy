import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const parser = yargs(hideBin(process.argv))
  .scriptName("tool")
  .usage("$0 <command> [args]")
  .version("fleet-e2e-toy v1.0.0")
  .alias("v", "version")
  .help()
  .alias("h", "help")
  .command("help", "Show help", () => {}, () => {
    parser.showHelp();
  })
  .command("add <title>", "Add a new note", (y) => {
    return y.positional("title", { describe: "Note title", type: "string" });
  }, (argv) => {
    const title = argv.title as string;
    if (!title || title.trim() === "") {
      console.error("Error: title cannot be blank");
      process.exit(1);
    }
    console.log(`Added note: \${title}`);
  })
  .demandCommand(1, "You must provide a command")
  .strict();

parser.argv;


