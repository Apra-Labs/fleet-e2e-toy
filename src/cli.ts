#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs";
import * as path from "path";

const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

yargs(hideBin(process.argv))
  .version(pkg.version)
  .command("*", "NoteAPI CLI", () => {})
  .help()
  .strict()
  .parse();
