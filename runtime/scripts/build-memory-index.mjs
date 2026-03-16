#!/usr/bin/env node
import { markdownSections, readConfig, sourceEntries, writeJson, writeText } from './lib.mjs';

const config = readConfig();
const sources = sourceEntries(config.memorySources ?? []);

const entries = [];
for (const source of sources) {
  const sections = markdownSections(source.text);
  for (const [index, section] of sections.entries()) {
    entries.push({
      id: `${source.path.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${index + 1}`,
      source: source.path,
      label: source.label,
      tierHint: source.tier,
      heading: section.heading,
      preview: section.body.split(/\s+/).slice(0, 40).join(' '),
    });
  }
}

writeJson('runtime/generated/memory-index.json', {
  count: entries.length,
  entries,
});

const md = [
  '# Cogochi Runtime Memory Index',
  '',
  `Entries: ${entries.length}`,
  '',
  ...entries.map(
    (entry) =>
      `- \`${entry.tierHint}\` ${entry.label} -> ${entry.heading} (\`${entry.source}\`)\n  - ${entry.preview}`,
  ),
  '',
].join('\n');

writeText('runtime/generated/memory-index.md', `${md}\n`);
console.log('runtime/generated/memory-index.json');
