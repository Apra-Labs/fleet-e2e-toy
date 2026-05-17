import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .scriptName("tool")
  .usage("$0 <command> [args]")
  .help()
  .argv;

