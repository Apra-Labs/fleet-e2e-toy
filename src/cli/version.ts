// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../../package.json") as { version: string };

export const VERSION = `fleet-e2e-toy v${pkg.version}`;
