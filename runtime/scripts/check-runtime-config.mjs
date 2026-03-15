#!/usr/bin/env node
import { exists, readConfig } from './lib.mjs';

const config = readConfig();
const checks = [
  ['version is 1', config.version === 1],
  ['adapter platform is openclaw', config.adapter?.platform === 'openclaw'],
  ['fallback is declared', Boolean(config.adapter?.fallback)],
  ['memory service dir exists', exists(config.paths?.memoryServiceDir ?? '')],
  ['bundle sources exist', (config.bundleSources ?? []).every((entry) => exists(entry.path))],
  ['memory sources exist', (config.memorySources ?? []).every((entry) => exists(entry.path))],
  ['session boot prompt exists', exists('runtime/prompts/session-boot.md')],
  ['nightly distill prompt exists', exists('runtime/prompts/nightly-memory-distill.md')],
  ['relay prompt exists', exists('runtime/prompts/cross-agent-relay.md')],
];

const missing = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (missing.length > 0) {
  console.error(JSON.stringify({ ok: false, missing }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checks: checks.map(([label]) => label) }, null, 2));
