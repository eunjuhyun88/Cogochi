#!/usr/bin/env node
import {
  normalizeScore,
  readText,
  scoreFromChecks,
  statusFromScore,
  writeReport,
} from './lib.mjs';

const fieldSpec = readText('docs/product-specs/field.md');
const fieldDirection = readText('docs/design-docs/chartfield-fullgame-direction.md');
const fullGamePlan = readText('docs/exec-plans/active/COGOCHI_full_game_autoresearch_20260312.md');
const pokemonTarget = readText('docs/design-docs/COGOCHI_pokemon_grade_game_target_20260313.md');
const pokemonPlan = readText('docs/exec-plans/active/COGOCHI_pokemon_grade_autoresearch_20260313.md');
const visualWorld = readText('docs/VISUAL_WORLD_DESIGN.md');
const routeMap = readText('docs/generated/route-map.md');
const fieldRoute = readText('src/routes/field/+page.svelte');
const fieldServerRoute = readText('src/routes/field/+page.server.ts');
const fieldScene = readText('src/components/shared/FieldScene.svelte');
const fieldStore = readText('src/lib/stores/fieldStore.ts');
const battleRoute = readText('src/routes/battle/+page.svelte');
const rosterRoute = readText('src/routes/roster/+page.svelte');
const journalRoute = readText('src/routes/journal/+page.svelte');
const hasJournalRoute = journalRoute.length > 0;
const hasSparGate = fieldStore.toLowerCase().includes('spar gate') || fieldStore.includes("id: 'spar-gate'");
const hasJournalBoardNode = fieldStore.toLowerCase().includes('journal board') || fieldStore.includes("id: 'journal-board'");

const specChecks = [
  {
    label: 'field spec defines a top-down field route',
    passed: fieldSpec.includes('Canonical route entry: `/field`') && fieldSpec.includes('top-down field'),
  },
  {
    label: 'pokemon target defines a world-first loop and required spaces',
    passed:
      pokemonTarget.includes('## The Canonical Session Loop') &&
      pokemonTarget.includes('Spar Gate') &&
      pokemonTarget.includes('Proof Gate') &&
      pokemonTarget.includes('Journal Board'),
  },
  {
    label: 'pokemon target defines route teaching beats',
    passed:
      pokemonTarget.includes('Safe Introduction') &&
      pokemonTarget.includes('Development') &&
      pokemonTarget.includes('Twist') &&
      pokemonTarget.includes('Return'),
  },
  {
    label: 'active plans define world-first and return-pressure phases',
    passed:
      pokemonPlan.includes('### Phase 1. World-First Loop') &&
      pokemonPlan.includes('### Phase 4. Return-Pressure Surfaces') &&
      fullGamePlan.includes('field travel -> one care or training action -> battle gate entry -> controllable chart clash -> reflection and keepsake writeback -> return to field'),
  },
  {
    label: 'visual world contract already supports explore and clash travel moods',
    passed:
      visualWorld.includes('### Explore Mode') &&
      visualWorld.includes('### Clash Mode') &&
      visualWorld.includes('my 3 agents are companions, not UI widgets'),
  },
];

const implementationChecks = [
  {
    label: 'route map includes world-loop routes',
    passed:
      routeMap.includes('| `/field` |') &&
      routeMap.includes('| `/battle` |') &&
      routeMap.includes('| `/lab` |') &&
      routeMap.includes('| `/roster` |'),
  },
  {
    label: 'field route owns movement and interaction code',
    passed:
      fieldRoute.includes('triggerInteract') &&
      fieldRoute.includes('fieldStore.setInput') &&
      fieldRoute.includes('WASD'),
  },
  {
    label: 'field route loads runtime artifacts and return context on the server',
    passed: fieldServerRoute.includes('readRuntimeArtifacts') && fieldServerRoute.includes('returnContext'),
  },
  {
    label: 'field route sends active historical frame into battle and receives verdict-aware returns',
    passed:
      fieldRoute.includes('/battle?entry=field&frame=') &&
      fieldRoute.includes('getScenarioForHistoricalFrame') &&
      fieldRoute.includes('data.returnContext'),
  },
  {
    label: 'field route consumes runtime distill guidance in-world',
    passed:
      fieldRoute.includes('data.runtime') &&
      fieldRoute.includes('field-cue-card') &&
      fieldRoute.includes('runtimeCueNodeId'),
  },
  {
    label: 'field scene renders runtime beacons in world-space',
    passed:
      fieldScene.includes('runtimeCueNodeId') &&
      fieldScene.includes('field-node__beam') &&
      fieldScene.includes('field-node__tag') &&
      fieldScene.includes('field-scene__cue-guide'),
  },
  {
    label: 'field scene renders a BTC historical-frame battlefield',
    passed: fieldScene.includes('getFieldHistoricalFrames') && fieldScene.includes('resolveHistoricalFieldFrame'),
  },
  {
    label: 'field store includes camp, lab, archive, and proof gate nodes',
    passed:
      fieldStore.includes("id: 'camp'") &&
      fieldStore.includes("id: 'lab-bench'") &&
      fieldStore.includes("id: 'archive-well'") &&
      fieldStore.includes("id: 'battle-gate'"),
  },
  {
    label: 'battle route supports a verdict-gated return to field',
    passed:
      battleRoute.includes('Choose verdict first') &&
      battleRoute.includes('Return to field') &&
      battleRoute.includes("params.set('verdict', appliedVerdict)"),
  },
  {
    label: 'battle route opens with a short proof brief',
    passed:
      battleRoute.includes('battleBriefTitle') &&
      battleRoute.includes('battleBriefText') &&
      battleRoute.includes('battle-brief'),
  },
  {
    label: 'journal route exists in app code',
    passed: hasJournalRoute,
  },
  {
    label: 'field runtime includes a separate spar gate',
    passed: hasSparGate,
  },
  {
    label: 'field runtime includes a journal board or equivalent return node',
    passed: hasJournalBoardNode,
  },
  {
    label: 'roster route can serve as a field-side squad surface',
    passed: rosterRoute.includes('Choose who to raise next'),
  },
];

const loopChecks = [
  {
    label: 'field spec defines camp, lab, archive, and battle gate',
    passed: fieldSpec.includes('Camp') && fieldSpec.includes('Lab Bench') && fieldSpec.includes('Archive Well') && fieldSpec.includes('Battle Gate'),
  },
  {
    label: 'direction and target docs define party composition and movement states',
    passed:
      fieldDirection.includes('## Party Composition') &&
      fieldDirection.includes('## Required Movement States') &&
      pokemonTarget.includes('## World Structure'),
  },
  {
    label: 'plans define journal and return-to-care support',
    passed:
      fullGamePlan.includes('/journal') &&
      fullGamePlan.includes('return to camp') &&
      pokemonPlan.includes('journal-route-shell') &&
      pokemonPlan.includes('camp-return-summary-pass'),
  },
  {
    label: 'plans include detailed field foundation tasks',
    passed:
      fullGamePlan.includes('field-route-shell') &&
      fullGamePlan.includes('party-follow-pass') &&
      fullGamePlan.includes('field-node-graph') &&
      pokemonPlan.includes('field-spar-gate') &&
      pokemonPlan.includes('field-proof-gate') &&
      pokemonPlan.includes('field-journal-board'),
  },
  {
    label: 'field route writes a verdict-aware return status',
    passed: fieldRoute.includes('fieldStore.setFieldStatus') && fieldRoute.includes("returnContext.verdict === 'QUARANTINED'"),
  },
  {
    label: 'field route turns runtime distill into a next-node objective',
    passed:
      fieldRoute.includes('chooseRuntimeCheck') &&
      fieldRoute.includes('targetNodeIdForCue') &&
      fieldRoute.includes('runtimeCueText'),
  },
];

const specScore = scoreFromChecks(specChecks);
const implementationScore = scoreFromChecks(implementationChecks);
const loopScore = scoreFromChecks(loopChecks);
const uncappedReadinessScore = normalizeScore(specScore * 0.2 + implementationScore * 0.65 + loopScore * 0.15);
const readinessScore = normalizeScore(
  !hasJournalRoute || !hasSparGate
    ? Math.min(uncappedReadinessScore, 0.74)
    : !hasJournalBoardNode
      ? Math.min(uncappedReadinessScore, 0.78)
      : uncappedReadinessScore
);
const status = statusFromScore(readinessScore);

const weakestArea = [
  ['spec', specScore],
  ['implementation', implementationScore],
  ['loop', loopScore],
].sort((left, right) => left[1] - right[1])[0]?.[0] ?? 'unknown';

const report = {
  type: 'field-loop-eval',
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
    !hasJournalRoute || !hasSparGate
      ? 'Pokemon-grade alpha is still blocked because the world loop lacks a shipped journal return surface or a distinct spar gate.'
      : implementationScore < 0.5
      ? 'The world-first loop target is documented, but runtime support for journal, spar gate, and return-pressure nodes is still thin.'
      : 'The field loop exists, but the route set is still missing some Pokemon-grade alpha pieces.',
  ],
};

const paths = writeReport('field-loop-eval', report);
console.log(JSON.stringify({
  status: report.status,
  score: report.score,
  latestReport: paths.latestPath,
}, null, 2));
