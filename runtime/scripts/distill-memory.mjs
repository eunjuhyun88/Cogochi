#!/usr/bin/env node
import { readConfig, readText, writeText } from './lib.mjs';

const config = readConfig();
const memoryIndex = JSON.parse(readText('runtime/generated/memory-index.json') || '{"entries": []}');
const byTier = new Map();

for (const entry of memoryIndex.entries ?? []) {
  const items = byTier.get(entry.tierHint) ?? [];
  items.push(entry);
  byTier.set(entry.tierHint, items);
}

const tierLines = ['M0', 'M30', 'M90', 'M365'].flatMap((tier) => {
  const items = byTier.get(tier) ?? [];
  return [
    `## ${tier}`,
    ...(items.length > 0 ? items.slice(0, 6).map((item) => `- ${item.label}: ${item.heading}`) : ['- none']),
    '',
  ];
});

const lines = [
  '# Cogochi Nightly Distill Report',
  '',
  `Goal: ${config.project?.goal ?? 'unknown'}`,
  '',
  '## Promotion Rules',
  '- Keep `M0` for invariants and memory guardrails.',
  '- Keep `M30` for fresh checkpoints and active refactor focus.',
  '- Promote proven system patterns into `M90`.',
  '- Reserve `M365` for founder-goal and architecture truths.',
  '',
  ...tierLines,
  '## Suggested Next Checks',
  '- Keep `src/lib/services/memory/writeback.ts` aligned with `runtime/runtime-config.json` memory sources.',
  '- Rebuild the project context bundle when surface specs or program rules change.',
  '- Do not let runtime prompts override deterministic battle truth.',
  '',
];

writeText('runtime/generated/nightly-distill-report.md', `${lines.join('\n')}\n`);
console.log('runtime/generated/nightly-distill-report.md');
