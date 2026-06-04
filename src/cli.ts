import * as process from "process";

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-v") || args.includes("--version")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }

  console.log("NoteAPI CLI initialized");
  if (args.length > 0) {
    console.log("Arguments:", args.join(" "));
  }
}

main();

