import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .scriptName("tool")
  .usage("$0 <command> [args]")
  .version("fleet-e2e-toy v1.0.0")
  .alias("v", "version")
  .help()
  .argv;

