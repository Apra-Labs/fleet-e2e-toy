import * as process from "process";

function main() {
  const args = process.argv.slice(2);
  console.log("NoteAPI CLI initialized");
  if (args.length > 0) {
    console.log("Arguments:", args.join(" "));
  }
}

main();
