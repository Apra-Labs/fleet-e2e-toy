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
  .command("add", "Add a new note", (y) => {
    return y.positional("title", { describe: "Note title", type: "string" });
  })
  .command("serve", "Start the server", () => {})
  .demandCommand(1, "You must provide a command");

parser.argv;

