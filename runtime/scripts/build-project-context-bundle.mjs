#!/usr/bin/env node
import { readConfig, sourceEntries, writeText } from './lib.mjs';

const config = readConfig();
const sources = sourceEntries(config.bundleSources ?? []);

const parts = [
  '# Cogochi Runtime Project Context Bundle',
  '',
  'This bundle is generated from canonical repo-local truth.',
  `Goal: ${config.project?.goal ?? 'unknown'}`,
  '',
];

for (const source of sources) {
  parts.push(`## ${source.label}`);
  parts.push(`Source: \`${source.path}\``);
  parts.push('');
  parts.push(source.text.trim());
  parts.push('');
}

writeText('runtime/generated/project-context-bundle.md', `${parts.join('\n')}\n`);
console.log('runtime/generated/project-context-bundle.md');
