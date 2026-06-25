#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist', 'tool.js');
if (fs.existsSync(distPath)) {
  const tool = require(distPath);
  tool.main(process.argv.slice(2));
} else {
  require('ts-node').register();
  const tool = require(path.join(__dirname, 'src', 'tool.ts'));
  tool.main(process.argv.slice(2));
}
