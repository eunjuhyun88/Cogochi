#!/usr/bin/env node
import {
  exists,
  normalizeScore,
  readText,
  scoreFromChecks,
  statusFromScore,
  writeReport,
} from './lib.mjs';

const program = readText('program.md');
const contextKit = readText('context-kit.json');
const proofSpec = readText('docs/product-specs/proof.md');
const proofDesign = readText('docs/design-docs/COGOCHI_proof_validation_20260315.md');
const proofPlan = readText('docs/exec-plans/active/COGOCHI_proof_validation_execution_20260315.md');
const agentSystem = readText('docs/AGENT_SYSTEM_DESIGN.md');
const proofRoute = readText('src/routes/proof/+page.svelte');
const proofServerRoute = readText('src/routes/proof/+page.server.ts');
const proofSystem = readText('src/lib/engine/proof-system.ts');
const battleRoute = readText('src/routes/battle/+page.svelte');
const journalRoute = readText('src/routes/journal/+page.svelte');
const fieldRoute = readText('src/routes/field/+page.svelte');
const fieldServerRoute = readText('src/routes/field/+page.server.ts');
const labRoute = readText('src/routes/lab/+page.svelte');
const agentRoute = readText('src/routes/agent/[id]/+page.svelte');

const specChecks = [
  {
    label: 'proof spec defines proof as game-native backtest',
    passed:
      proofSpec.includes('game-native version of a backtest') &&
      proofSpec.includes('historical validation') &&
      proofSpec.includes('deterministic score priorities'),
  },
  {
    label: 'proof spec defines spar, proof, and gauntlet modes',
    passed:
      proofSpec.includes('### `SPAR`') &&
      proofSpec.includes('### `PROOF`') &&
      proofSpec.includes('### `GAUNTLET`'),
  },
  {
    label: 'proof design fixes shadow return as secondary evidence',
    passed:
      proofDesign.toLowerCase().includes('shadow return') &&
      proofDesign.includes('never define it alone') &&
      proofDesign.toLowerCase().includes('historical validation system'),
  },
  {
    label: 'agent system distinguishes proof from battle',
    passed:
      agentSystem.includes('### 3.1 Proof Versus Battle') &&
      agentSystem.includes('game-native backtest'),
  },
  {
    label: 'execution plan defines frontend, shared-domain, and backend rollout',
    passed:
      proofPlan.includes('Frontend track') &&
      proofPlan.includes('Shared deterministic domain track') &&
      proofPlan.includes('Backend/runtime track'),
  },
];

const implementationChecks = [
  {
    label: 'proof route and server route exist',
    passed: exists('src/routes/proof/+page.svelte') && exists('src/routes/proof/+page.server.ts'),
  },
  {
    label: 'context kit registers proof as first-class surface and harness page',
    passed:
      contextKit.includes('"id": "proof"') &&
      contextKit.includes('"/proof"'),
  },
  {
    label: 'proof system defines multiple named historical packs',
    passed:
      proofSystem.includes('panic-discipline-pack') &&
      proofSystem.includes('whipsaw-control-pack') &&
      proofSystem.includes('public-passport-gauntlet'),
  },
  {
    label: 'proof route renders proof packs, runtime goal, and first clash launch',
    passed:
      proofRoute.includes('proofPacks') &&
      proofRoute.includes('Runtime goal') &&
      proofRoute.includes('Run proof opener'),
  },
  {
    label: 'lab and agent surfaces link into proof',
    passed:
      labRoute.includes('href="/proof"') &&
      agentRoute.includes('href="/proof"'),
  },
];

const loopChecks = [
  {
    label: 'battle supports proof gate context and verdict gating',
    passed:
      battleRoute.includes('Proof Gate') &&
      battleRoute.includes('Choose verdict first') &&
      battleRoute.includes("params.set('verdict', appliedVerdict)"),
  },
  {
    label: 'journal and field consume proof return context',
    passed:
      journalRoute.includes('Proof Gate') &&
      (fieldServerRoute.includes("params.get('verdict')") || fieldRoute.includes('data.returnContext')) &&
      fieldRoute.includes('proof'),
  },
  {
    label: 'proof route frames mutation compare against a fixed anchor',
    passed:
      proofRoute.includes('Draft mutation against the first proof anchor') &&
      proofRoute.includes('deterministic sequence, not one lucky screenshot'),
  },
  {
    label: 'program treats fixed proof packs as a hard rule',
    passed:
      program.includes('fixed historical proof packs') &&
      program.includes('keep or revert'),
  },
];

const specScore = scoreFromChecks(specChecks);
const implementationScore = scoreFromChecks(implementationChecks);
const loopScore = scoreFromChecks(loopChecks);
const readinessScore = normalizeScore(specScore * 0.3 + implementationScore * 0.45 + loopScore * 0.25);
const status = statusFromScore(readinessScore);

const weakestArea = [
  ['spec', specScore],
  ['implementation', implementationScore],
  ['loop', loopScore],
].sort((left, right) => left[1] - right[1])[0]?.[0] ?? 'unknown';

const report = {
  type: 'proof-readiness',
  status,
  score: readinessScore,
  checkedAt: new Date().toISOString(),
  scores: {
    spec: specScore,
    implementation: implementationScore,
    loop: loopScore,
  },
  checks: {
    spec: specChecks,
    implementation: implementationChecks,
    loop: loopChecks,
  },
  notes: [
    `Weakest area: ${weakestArea}.`,
    readinessScore >= 0.8
      ? 'Proof is now a first-class game-native backtest surface with fixed packs, route integration, and deterministic verdict framing.'
      : 'Proof still needs stronger route integration or validation contracts before it can serve as the repo’s concrete backtest layer.',
  ],
};

const paths = writeReport('proof-readiness', report);
console.log(JSON.stringify({
  status: report.status,
  score: report.score,
  latestReport: paths.latestPath,
}, null, 2));
