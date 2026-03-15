#!/usr/bin/env node
import {
  exists,
  normalizeScore,
  readText,
  scoreFromChecks,
  shellStatus,
  statusFromScore,
  writeReport,
} from './lib.mjs';

const packageJson = readText('package.json');
const contextKit = readText('context-kit.json');
const program = readText('program.md');
const memoryService = readText('src/lib/services/memory/writeback.ts');
const memoryTypes = readText('src/lib/types.ts');
const memoryDocs = readText('src/lib/services/memory/CLAUDE.md');
const agentRoute = readText('src/routes/agent/[id]/+page.svelte');
const labRoute = readText('src/routes/lab/+page.svelte');
const proofRoute = readText('src/routes/proof/+page.svelte');
const battleRoute = readText('src/routes/battle/+page.svelte');
const journalRoute = readText('src/routes/journal/+page.svelte');
const fieldRoute = readText('src/routes/field/+page.svelte');

const runtimeCheck = shellStatus('npm run runtime:check');
const runtimeBundle = shellStatus('npm run runtime:bundle');
const runtimeIndex = shellStatus('npm run runtime:index');
const runtimeDistill = shellStatus('npm run runtime:distill');

const layerChecks = [
  {
    label: 'runtime config exists',
    passed: exists('runtime/runtime-config.json'),
  },
  {
    label: 'runtime readme exists',
    passed: exists('runtime/README.md'),
  },
  {
    label: 'runtime prompts exist',
    passed:
      exists('runtime/prompts/session-boot.md') &&
      exists('runtime/prompts/nightly-memory-distill.md') &&
      exists('runtime/prompts/cross-agent-relay.md'),
  },
  {
    label: 'runtime jobs exist',
    passed:
      exists('runtime/jobs/session-boot.json') &&
      exists('runtime/jobs/nightly-memory-distill.json') &&
      exists('runtime/jobs/cross-agent-relay.json'),
  },
  {
    label: 'runtime scripts exist',
    passed:
      exists('runtime/scripts/check-runtime-config.mjs') &&
      exists('runtime/scripts/build-project-context-bundle.mjs') &&
      exists('runtime/scripts/build-memory-index.mjs') &&
      exists('runtime/scripts/distill-memory.mjs') &&
      exists('runtime/scripts/relay-crossview.mjs'),
  },
  {
    label: 'context kit models multiple real surfaces',
    passed:
      contextKit.includes('"id": "raising"') &&
      contextKit.includes('"id": "proof"') &&
      contextKit.includes('"id": "battle"') &&
      contextKit.includes('"id": "journal"'),
  },
  {
    label: 'program mentions memento or runtime layer rules',
    passed: program.includes('Memento Layer Model') || program.includes('Memento Translation Rules'),
  },
];

const memoryChecks = [
  {
    label: 'memory types include tier and source',
    passed: memoryTypes.includes('MemoryTier') && memoryTypes.includes('MemorySource'),
  },
  {
    label: 'memory service exposes training and battle writeback',
    passed: memoryService.includes('buildTrainingWriteback') && memoryService.includes('buildBattleWriteback'),
  },
  {
    label: 'memory service actually writes tiered memory cards',
    passed: memoryService.includes("tier: memoryTierForDecision") && memoryService.includes("source: 'TRAINING'") && memoryService.includes("source: 'BATTLE'"),
  },
  {
    label: 'memory ui surfaces render tier or memento summary',
    passed: agentRoute.includes('memoryTierLabels') && labRoute.includes('Memento memory tiers'),
  },
  {
    label: 'memory docs mention tiering and runtime separation',
    passed: memoryDocs.includes('M0') && memoryDocs.includes('runtime distillation'),
  },
];

const automationChecks = [
  {
    label: 'package scripts include runtime commands',
    passed:
      packageJson.includes('"runtime:check"') &&
      packageJson.includes('"runtime:bundle"') &&
      packageJson.includes('"runtime:index"') &&
      packageJson.includes('"runtime:distill"') &&
      packageJson.includes('"autoresearch:runtime"'),
  },
  {
    label: 'runtime check command passes',
    passed: runtimeCheck.ok,
  },
  {
    label: 'runtime bundle command passes',
    passed: runtimeBundle.ok,
  },
  {
    label: 'runtime index command passes',
    passed: runtimeIndex.ok,
  },
  {
    label: 'runtime distill command passes',
    passed: runtimeDistill.ok,
  },
  {
    label: 'journal runtime load exists',
    passed: exists('src/routes/journal/+page.server.ts'),
  },
  {
    label: 'battle runtime load exists',
    passed: exists('src/routes/battle/+page.server.ts'),
  },
  {
    label: 'field runtime load exists',
    passed: exists('src/routes/field/+page.server.ts'),
  },
  {
    label: 'proof runtime load exists',
    passed: exists('src/routes/proof/+page.server.ts'),
  },
];

const generatedChecks = [
  {
    label: 'project context bundle generated',
    passed: exists('runtime/generated/project-context-bundle.md'),
  },
  {
    label: 'memory index json generated',
    passed: exists('runtime/generated/memory-index.json'),
  },
  {
    label: 'memory index markdown generated',
    passed: exists('runtime/generated/memory-index.md'),
  },
  {
    label: 'nightly distill report generated',
    passed: exists('runtime/generated/nightly-distill-report.md'),
  },
  {
    label: 'journal consumes runtime distill and index outputs',
    passed: journalRoute.includes('data.runtime') && journalRoute.includes('Nightly distill') && journalRoute.includes('memoryIndexByTier'),
  },
  {
    label: 'battle exposes journal handoff plus runtime advisory',
    passed:
      battleRoute.includes('Open journal review') &&
      battleRoute.includes('Nightly distill') &&
      battleRoute.includes('battleBriefText'),
  },
  {
    label: 'field exposes in-world runtime cue and next node guidance',
    passed:
      fieldRoute.includes('data.runtime') &&
      fieldRoute.includes('field-cue-card') &&
      fieldRoute.includes('runtimeCueText') &&
      fieldRoute.includes('runtimeCueNode'),
  },
  {
    label: 'proof consumes runtime artifacts and proof packs',
    passed:
      proofRoute.includes('data.runtime') &&
      proofRoute.includes('proofPacks') &&
      proofRoute.includes('Game-native backtest') &&
      proofRoute.includes('historical validation'),
  },
];

const layerScore = scoreFromChecks(layerChecks);
const memoryScore = scoreFromChecks(memoryChecks);
const automationScore = scoreFromChecks(automationChecks);
const generatedScore = scoreFromChecks(generatedChecks);
const readinessScore = normalizeScore(
  layerScore * 0.25 +
  memoryScore * 0.35 +
  automationScore * 0.2 +
  generatedScore * 0.2,
);

const report = {
  type: 'runtime-readiness',
  checkedAt: new Date().toISOString(),
  status: statusFromScore(readinessScore),
  score: readinessScore,
  scores: {
    layerContract: layerScore,
    memoryBoundary: memoryScore,
    automationHooks: automationScore,
    generatedArtifacts: generatedScore,
  },
  checks: {
    layerChecks,
    memoryChecks,
    automationChecks,
    generatedChecks,
  },
  summary:
    readinessScore >= 0.8
      ? 'The repo now has a Memento-style runtime layer that can build bundle, index, and distill artifacts without breaking deterministic evaluation.'
      : 'Runtime layering still needs stronger contract or automation coverage before it can guide the OpenClaw path safely.',
};

const paths = writeReport('runtime-readiness', report);
console.log(JSON.stringify({
  status: report.status,
  score: report.score,
  latestReport: paths.latestPath,
}, null, 2));
