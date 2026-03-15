#!/usr/bin/env node
import {
  exists,
  normalizeScore,
  readText,
  readLatest,
  shellStatus,
  scoreFromChecks,
  writeReport,
} from './lib.mjs';

const openclawHealth = readLatest('openclaw-health');
const battleBenchmark = readLatest('battle-benchmark');
const fieldLoopEval = readLatest('field-loop-eval');
const proofReadiness = readLatest('proof-readiness');
const raisingEval = readLatest('raising-eval');
const runtimeReadiness = readLatest('runtime-readiness');

const docsGate = shellStatus('npm run docs:check');
const battleRoute = readText('src/routes/battle/+page.svelte');
const fieldRoute = readText('src/routes/field/+page.svelte');
const journalRoute = readText('src/routes/journal/+page.svelte');
const proofRoute = readText('src/routes/proof/+page.svelte');
const fieldStore = readText('src/lib/stores/fieldStore.ts');
const hasJournalRoute = journalRoute.length > 0;
const hasSparGate = fieldStore.toLowerCase().includes('spar gate') || fieldStore.includes("id: 'spar-gate'");
const hasJournalBoardNode = fieldStore.toLowerCase().includes('journal board') || fieldStore.includes("id: 'journal-board'");

const hardGates = [
  {
    label: 'program exists',
    passed: exists('program.md'),
  },
  {
    label: 'founder goal exists',
    passed: exists('docs/exec-plans/active/COGOCHI_founder_goal_20260312.md'),
  },
  {
    label: 'docs check passes',
    passed: docsGate.ok,
  },
  {
    label: 'pokemon-grade target docs exist',
    passed:
      exists('docs/design-docs/COGOCHI_pokemon_grade_game_target_20260313.md') &&
      exists('docs/exec-plans/active/COGOCHI_pokemon_grade_autoresearch_20260313.md'),
  },
];

const implementationChecks = [
  {
    label: 'docs check passes',
    passed: docsGate.ok,
  },
  {
    label: 'core autoresearch docs exist',
    passed:
      exists('program.md') &&
      exists('docs/exec-plans/active/COGOCHI_founder_goal_20260312.md') &&
      exists('docs/exec-plans/active/COGOCHI_autoresearch_scorecard_20260312.md') &&
      exists('docs/exec-plans/active/COGOCHI_autoresearch_bottlenecks_20260312.md'),
  },
  {
    label: 'core autoresearch agents exist',
    passed:
      exists('agents/autoresearch-director.json') &&
      exists('agents/battle-researcher.json') &&
      exists('agents/raising-ux-shipper.json') &&
      exists('agents/memory-tuner.json') &&
      exists('agents/ship-reviewer.json'),
  },
  {
    label: 'core autoresearch tools exist',
    passed:
      exists('tools/openclaw-health.json') &&
      exists('tools/battle-benchmark.json') &&
      exists('tools/proof-readiness.json') &&
      exists('tools/raising-ux-eval.json') &&
      exists('tools/runtime-readiness.json') &&
      exists('tools/scorecard-report.json') &&
      exists('tools/change-acceptance.json'),
  },
  {
    label: 'core autoresearch scripts exist',
    passed:
      exists('scripts/autoresearch/run-openclaw-health.mjs') &&
      exists('scripts/autoresearch/run-battle-benchmark.mjs') &&
      exists('scripts/autoresearch/run-proof-readiness.mjs') &&
      exists('scripts/autoresearch/run-raising-eval.mjs') &&
      exists('scripts/autoresearch/run-runtime-readiness.mjs') &&
      exists('scripts/autoresearch/score-branch.mjs') &&
      exists('scripts/autoresearch/accept-change.mjs'),
  },
  {
    label: 'runtime worker exists',
    passed: exists('agents/runtime-memory-architect.json'),
  },
];

const implementationQuality = scoreFromChecks(implementationChecks);
const openclawScore =
  openclawHealth?.status === 'ready'
    ? 1
    : openclawHealth?.status === 'partial'
      ? 0.7
      : openclawHealth
        ? 0.2
        : 0;
const battleScore = normalizeScore(battleBenchmark?.score ?? 0);
const fieldLoopScore = normalizeScore(fieldLoopEval?.score ?? 0);
const proofScore = normalizeScore(proofReadiness?.score ?? 0);
const raisingScore = normalizeScore(raisingEval?.score ?? 0);
const runtimeScore = normalizeScore(runtimeReadiness?.score ?? 0);
const ownershipScore = normalizeScore(raisingEval?.scores?.ownership ?? raisingScore);
const trainingProofScore = normalizeScore(raisingEval?.scores?.trainingProof ?? raisingScore);
const transformationScore = normalizeScore(raisingEval?.scores?.transformation ?? 0);
const mutationProofScore = normalizeScore(raisingEval?.scores?.mutationProof ?? 0);
const trustCalibrationScore = normalizeScore(raisingEval?.scores?.trustCalibration ?? 0);
const careLoopScore = normalizeScore(raisingEval?.scores?.careLoop ?? 0);
const explanationClarityScore = normalizeScore(raisingEval?.scores?.explanationClarity ?? 0);
const sessionPullScore = normalizeScore(raisingEval?.scores?.sessionPull ?? 0);
const uncappedWorldFirstSessionLoop = normalizeScore(
  fieldLoopScore * 0.55 +
  sessionPullScore * 0.15 +
  (fieldRoute.includes("params.get('verdict')") ? 0.08 : 0) +
  (battleRoute.includes('Choose verdict first') ? 0.08 : 0) +
  (exists('src/routes/field/+page.svelte') ? 0.07 : 0) +
  (hasJournalRoute ? 0.07 : 0)
);
const worldFirstSessionLoop = normalizeScore(
  !hasJournalRoute || !hasSparGate
    ? Math.min(uncappedWorldFirstSessionLoop, 0.72)
    : !hasJournalBoardNode
      ? Math.min(uncappedWorldFirstSessionLoop, 0.78)
      : uncappedWorldFirstSessionLoop
);
const encounterLegibility = normalizeScore(
  battleScore * 0.4 +
  trainingProofScore * 0.18 +
  proofScore * 0.12 +
  explanationClarityScore * 0.15 +
  (battleRoute.includes('Run the chart stage') ? 0.1 : 0) +
  (proofRoute.includes('What proof measures') ? 0.05 : 0) +
  (battleRoute.includes('Use selected command') ? 0.1 : 0)
);
const uncappedReturnPressureClarity = normalizeScore(
  careLoopScore * 0.4 +
  mutationProofScore * 0.25 +
  (fieldRoute.includes('setFieldStatus') ? 0.15 : 0) +
  (hasJournalRoute ? 0.2 : 0)
);
const returnPressureClarity = normalizeScore(
  !hasJournalRoute
    ? Math.min(uncappedReturnPressureClarity, 0.58)
    : !hasJournalBoardNode
      ? Math.min(uncappedReturnPressureClarity, 0.68)
      : uncappedReturnPressureClarity
);
const memoryScore = normalizeScore(
  (exists('src/lib/services/memory') ? 0.2 : 0) +
  (exists('runtime/runtime-config.json') ? 0.15 : 0) +
  (exists('docs/AGENT_SYSTEM_DESIGN.md') ? 0.1 : 0) +
  (exists('docs/design-docs/judgment-tamagotchi-loop.md') ? 0.05 : 0) +
  (careLoopScore * 0.2) +
  (runtimeScore * 0.2) +
  (exists('docs/exec-plans/active/COGOCHI_judgment_tamagotchi_loop_20260312.md') ? 0.1 : 0)
);
const agentOwnershipTransformation = normalizeScore(
  ownershipScore * 0.45 +
  transformationScore * 0.35 +
  trustCalibrationScore * 0.2
);
const evolutionaryMutationLoop = normalizeScore(
  mutationProofScore * 0.42 +
  proofScore * 0.2 +
  trustCalibrationScore * 0.18 +
  transformationScore * 0.2
);
const trainingToBattleProof = normalizeScore(
  trainingProofScore * 0.35 +
  proofScore * 0.2 +
  battleScore * 0.2 +
  mutationProofScore * 0.1 +
  explanationClarityScore * 0.15
);
const trustAndExplanation = normalizeScore(
  trustCalibrationScore * 0.4 +
  explanationClarityScore * 0.3 +
  battleScore * 0.3
);
const uncappedGameFeelAndImplementation = normalizeScore(
  implementationQuality * 0.35 +
  sessionPullScore * 0.2 +
  fieldLoopScore * 0.2 +
  encounterLegibility * 0.1 +
  proofScore * 0.05 +
  runtimeScore * 0.1
);
const gameFeelAndImplementation = normalizeScore(
  !hasJournalRoute || !hasSparGate
    ? Math.min(uncappedGameFeelAndImplementation, 0.78)
    : !hasJournalBoardNode
      ? Math.min(uncappedGameFeelAndImplementation, 0.84)
      : uncappedGameFeelAndImplementation
);
const uncappedFounderOutcomeProgress = normalizeScore(
  worldFirstSessionLoop * 0.22 +
  encounterLegibility * 0.18 +
  agentOwnershipTransformation * 0.14 +
  evolutionaryMutationLoop * 0.14 +
  returnPressureClarity * 0.12 +
  trainingToBattleProof * 0.09 +
  trustAndExplanation * 0.05 +
  openclawScore * 0.03 +
  (hardGates.every((gate) => gate.passed) ? 0.03 : 0)
);
const founderOutcomeProgress = normalizeScore(
  !hasJournalRoute || !hasSparGate
    ? Math.min(uncappedFounderOutcomeProgress, 0.82)
    : !hasJournalBoardNode
      ? Math.min(uncappedFounderOutcomeProgress, 0.87)
      : uncappedFounderOutcomeProgress
);

const totalScore = normalizeScore(
  founderOutcomeProgress * 0.18 +
  worldFirstSessionLoop * 0.18 +
  encounterLegibility * 0.15 +
  agentOwnershipTransformation * 0.14 +
  evolutionaryMutationLoop * 0.12 +
  returnPressureClarity * 0.1 +
  trustAndExplanation * 0.08 +
  memoryScore * 0.05 +
  gameFeelAndImplementation * 0.05
);

const report = {
  type: 'score',
  checkedAt: new Date().toISOString(),
  hardGates,
  hardGatePass: hardGates.every((gate) => gate.passed),
  dimensions: {
    founderOutcomeProgress,
    worldFirstSessionLoop,
    encounterLegibility,
    fieldLoopCompleteness: fieldLoopScore,
    trainingToBattleProof,
    agentOwnershipTransformation,
    evolutionaryMutationLoop,
    returnPressureClarity,
    trustAndExplanation,
    memoryAndCareLoopReadiness: memoryScore,
    runtimeAutomationReadiness: runtimeScore,
    proofValidationReadiness: proofScore,
    gameFeelAndImplementation,
    openclawRuntimeReadiness: openclawScore,
    battleBenchmarkReadiness: battleScore,
    raisingLoopReadiness: raisingScore,
    transformationReadiness: transformationScore,
    mutationProofReadiness: mutationProofScore,
    trustCalibrationReadiness: trustCalibrationScore,
    explanationClarityReadiness: explanationClarityScore,
    careLoopReadiness: careLoopScore,
  },
  totalScore,
  gateEvidence: {
    docsCheck: docsGate,
  },
};

const paths = writeReport('score', report);
console.log(JSON.stringify({
  hardGatePass: report.hardGatePass,
  totalScore: report.totalScore,
  latestReport: paths.latestPath,
}, null, 2));
