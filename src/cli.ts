const VERSION_FLAGS = ["--version", "-v"];

if (VERSION_FLAGS.some((flag) => process.argv.includes(flag))) {
  console.log("fleet-e2e-toy v1.0.0");
  process.exit(0);
}

import("./index");
