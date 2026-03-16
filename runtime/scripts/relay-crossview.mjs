#!/usr/bin/env node
import path from 'node:path';
import { ensureDir, readConfig, writeText } from './lib.mjs';

const args = process.argv.slice(2);
const options = {
  from: '',
  to: '',
  message: '',
};

for (let index = 0; index < args.length; index += 1) {
  const current = args[index];
  const next = args[index + 1];
  if (current === '--from') {
    options.from = next ?? '';
    index += 1;
    continue;
  }
  if (current === '--to') {
    options.to = next ?? '';
    index += 1;
    continue;
  }
  if (current === '--message') {
    options.message = next ?? '';
    index += 1;
  }
}

if (!options.from || !options.to || !options.message) {
  console.error('Usage: node runtime/scripts/relay-crossview.mjs --from <sender> --to <receiver> --message <text>');
  process.exit(1);
}

const config = readConfig();
const relayDir = config.paths?.relayDir ?? 'runtime/generated/relay';
ensureDir(path.join(process.cwd(), relayDir));
const fileName = `${options.from}-to-${options.to.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`;

writeText(
  `${relayDir}/${fileName}`,
  `# Cross-Agent Relay\n\n- From: ${options.from}\n- To: ${options.to}\n- Message: ${options.message}\n`,
);

console.log(`${relayDir}/${fileName}`);
