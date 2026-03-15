#!/usr/bin/env node
import {
  readText,
  normalizeScore,
  writeReport,
} from './lib.mjs';

const raisingSpec = readText('docs/product-specs/raising.md');
const evolutionSpec = readText('docs/product-specs/evolution.md');
const pixelDirection = readText('docs/design-docs/pixel-agent-raising-direction.md');
const loopDesign = readText('docs/design-docs/judgment-tamagotchi-loop.md');
const evolutionDesign = readText('docs/design-docs/atlas-judgment-evolution.md');
const pokemonTarget = readText('docs/design-docs/COGOCHI_pokemon_grade_game_target_20260313.md');
const pokemonPlan = readText('docs/exec-plans/active/COGOCHI_pokemon_grade_autoresearch_20260313.md');
const loopPlan = readText('docs/exec-plans/active/COGOCHI_judgment_tamagotchi_loop_20260312.md');
const types = readText('src/lib/types.ts');
const hubRoute = readText('src/routes/+page.svelte');
const rosterRoute = readText('src/routes/roster/+page.svelte');
const agentRoute = readText('src/routes/agent/[id]/+page.svelte');
const labRoute = readText('src/routes/lab/+page.svelte');
const battleRoute = readText('src/routes/battle/+page.svelte');
const fieldRoute = readText('src/routes/field/+page.svelte');
const journalRoute = readText('src/routes/journal/+page.svelte');
const comparePanel = readText('src/components/shared/ComparePanel.svelte');
const battleSession = readText('src/lib/engine/battle-session.ts');
const battleView = readText('src/lib/engine/battle-view.ts');
const pixelSprite = readText('src/components/shared/PixelSprite.svelte');

function scoreFromChecks(checks) {
  if (!checks.length) {
    return 0;
  }
  const passed = checks.filter((check) => check.passed).length;
  return Number((passed / checks.length).toFixed(3));
}

const ownershipChecks = [
  {
    label: 'owned agent model includes bond, memory, and training history',
    passed: types.includes('bond: number;') && types.includes('memoryBank: AgentMemoryCard[];') && types.includes('trainingHistory: TrainingRun[];'),
  },
  {
    label: 'trainer hub explains the authored-agent loop',
    passed: hubRoute.includes('Raise your own chart agent') && hubRoute.includes('visible capability change'),
  },
  {
    label: 'roster surface exists in app code',
    passed: rosterRoute.includes('/agent/') || rosterRoute.includes('doctrine, memory'),
  },
  {
    label: 'agent detail route exists and exposes doctrine or memory',
    passed: agentRoute.includes('doctrineNote') && agentRoute.includes('memoryBank'),
  },
];

const trainingProofChecks = [
  {
    label: 'lab route edits indicator, script, doctrine, and memory bias',
    passed:
      labRoute.includes('indicatorPresetId') &&
      labRoute.includes('scriptPresetId') &&
      labRoute.includes('doctrineNote') &&
      labRoute.includes('memoryBias'),
  },
  {
    label: 'compare panel shows before vs after deltas',
    passed: comparePanel.includes('Current') && comparePanel.includes('Proposed') && comparePanel.includes('Delta'),
  },
  {
    label: 'battle route exists',
    passed: battleRoute.includes('Use selected command') || battleRoute.includes('Run the chart stage'),
  },
  {
    label: 'battle session provides controllable commands',
    passed: battleSession.includes('FOCUS_TAP') && battleSession.includes('MEMORY_PULSE') && battleSession.includes('RISK_VETO') && battleSession.includes('RETARGET'),
  },
  {
    label: 'battle and lab both expose explicit mutation verdict controls',
    passed:
      labRoute.includes('Keep mutation') &&
      labRoute.includes('Quarantine') &&
      labRoute.includes('Revert mutation') &&
      battleRoute.includes('Choose verdict first'),
  },
];

const transformationChecks = [
  {
    label: 'raising and pokemon target docs define visible stage growth',
    passed:
      raisingSpec.includes('visible body or keepsake change') &&
      raisingSpec.includes('Transformation States') &&
      pokemonTarget.includes('### 1. Stage Growth'),
  },
  {
    label: 'design docs define transformation models and growth layers',
    passed:
      loopDesign.includes('Visible Body Change') &&
      loopDesign.includes('Transformation Model') &&
      pokemonTarget.includes('## Growth Standard'),
  },
  {
    label: 'runtime state includes explicit transformation fields',
    passed:
      types.includes('growthStage') ||
      types.includes('keepsakes') ||
      types.includes('appearance') ||
      types.includes('fieldMarks'),
  },
  {
    label: 'sprite runtime renders stage and mutation overlays',
    passed:
      pixelSprite.includes("class:signature") &&
      pixelSprite.includes("class:specialized") &&
      pixelSprite.includes("class:tuned") &&
      pixelSprite.includes('pixel-sprite__overlay--crest'),
  },
  {
    label: 'app routes render explicit growth state or keepsake UI',
    passed:
      rosterRoute.includes('growth state') ||
      rosterRoute.includes('keepsake') ||
      agentRoute.includes('growth state') ||
      agentRoute.includes('keepsake'),
  },
];

const mutationProofChecks = [
  {
    label: 'evolution design defines a keep-or-revert mutation pipeline',
    passed:
      evolutionDesign.includes('Mutation Pipeline') &&
      evolutionDesign.includes('keep or revert') &&
      evolutionDesign.includes('proof pack'),
  },
  {
    label: 'evolution spec defines mutation bench and evolution log surfaces',
    passed:
      evolutionSpec.includes('Mutation Bench') &&
      evolutionSpec.includes('Evolution Log') &&
      evolutionSpec.includes('Keep Mutation') &&
      evolutionSpec.includes('Quarantine'),
  },
  {
    label: 'runtime state includes mutation or proven-frame fields',
    passed:
      types.includes('mutations') ||
      types.includes('provenFrames') ||
      types.includes('weakLink') ||
      types.includes('mutationDecision'),
  },
  {
    label: 'app surfaces expose mutation history or review language',
    passed:
      agentRoute.includes('mutation') ||
      battleRoute.includes('Keep') ||
      battleRoute.includes('Revert') ||
      labRoute.includes('mutation'),
  },
  {
    label: 'field route receives verdict-aware returns from battle',
    passed: fieldRoute.includes("params.get('verdict')") && battleRoute.includes("params.set('verdict', appliedVerdict)"),
  },
];

const trustCalibrationChecks = [
  {
    label: 'evolution design defines darwinian trust weights',
    passed: evolutionDesign.includes('Darwinian trust weights') && evolutionDesign.includes('trustWeight'),
  },
  {
    label: 'evolution spec defines trust display and proven frames',
    passed: evolutionSpec.includes('Trust Strip') && evolutionSpec.includes('Proven Frames'),
  },
  {
    label: 'runtime state includes trust or mastery fields',
    passed:
      types.includes('trustWeight') ||
      types.includes('voiceWeights') ||
      types.includes('masteryStats') ||
      types.includes('weakLink'),
  },
  {
    label: 'app surfaces mention trusted instincts or weak links',
    passed:
      agentRoute.includes('trust') ||
      agentRoute.includes('weak link') ||
      rosterRoute.includes('trust') ||
      battleRoute.includes('trusted'),
  },
];

const careLoopChecks = [
  {
    label: 'loop plan defines a care loop phase',
    passed: loopPlan.includes('Phase 4. Care Loop') && loopPlan.includes('memory drift'),
  },
  {
    label: 'raising spec defines meaningful maintenance states',
    passed: raisingSpec.includes('memory drift') && raisingSpec.includes('doctrine blur'),
  },
  {
    label: 'runtime state includes maintenance or drift fields',
    passed:
      types.includes('careState') ||
      types.includes('nextCareAction') ||
      types.includes('memoryDrift') ||
      types.includes('confidenceShake') ||
      types.includes('doctrineBlur') ||
      types.includes('squadFriction'),
  },
  {
    label: 'app surfaces expose a next care action',
    passed:
      agentRoute.includes('Next care action') || labRoute.includes('Next care action') || battleRoute.includes('next'),
  },
  {
    label: 'a journal return surface exists in app code',
    passed: journalRoute.length > 0,
  },
];

const explanationClarityChecks = [
  {
    label: 'evolution design ties battle proof to trusted voices and proven frames',
    passed:
      evolutionDesign.includes('trusted voices') &&
      evolutionDesign.includes('proven frame') &&
      evolutionDesign.includes('Battle Proof Rules'),
  },
  {
    label: 'evolution spec requires captain call and why-acted explanation',
    passed:
      evolutionSpec.includes('Captain Call Read') &&
      evolutionSpec.includes('why the captain made the call'),
  },
  {
    label: 'battle route exposes a decision layer to the player',
    passed: battleRoute.includes('Decision Layer') && battleRoute.includes('Why this clash is happening'),
  },
  {
    label: 'battle runtime carries readable explanation state',
    passed:
      battleView.includes('verdictLabel') ||
      battleView.includes('retrievalRead') ||
      battleSession.includes('logs: BattleTurnLog[];'),
  },
];

const sessionPullChecks = [
  {
    label: 'pixel direction doc exists',
    passed: pixelDirection.includes('The agent sprite is the emotional anchor.'),
  },
  {
    label: 'pokemon target defines first-10-second and five-minute loop standards',
    passed:
      pokemonTarget.includes('10 seconds') &&
      pokemonTarget.includes('2 to 5 minutes') &&
      pokemonPlan.includes('first-10-second-goal-pass'),
  },
  {
    label: 'battle is chart-forward and controllable',
    passed: battleRoute.includes('Run the chart stage') || battleRoute.includes('Use selected command'),
  },
  {
    label: 'raising flow points into battle and field return',
    passed: labRoute.includes('Preview battle') && battleRoute.includes('Return to field'),
  },
  {
    label: 'the loop is framed as a game, not a broker console',
    passed: hubRoute.includes('Trainer Hub') && labRoute.includes('You are not tweaking candles or faking PnL.'),
  },
  {
    label: 'a journal route exists to complete the return loop',
    passed: journalRoute.length > 0,
  },
];

const ownershipScore = scoreFromChecks(ownershipChecks);
const trainingProofScore = scoreFromChecks(trainingProofChecks);
const transformationScore = scoreFromChecks(transformationChecks);
const mutationProofScore = scoreFromChecks(mutationProofChecks);
const trustCalibrationScore = scoreFromChecks(trustCalibrationChecks);
const careLoopScore = scoreFromChecks(careLoopChecks);
const explanationClarityScore = scoreFromChecks(explanationClarityChecks);
const sessionPullScore = scoreFromChecks(sessionPullChecks);
const readinessScore = normalizeScore(
  ownershipScore * 0.15 +
  trainingProofScore * 0.2 +
  transformationScore * 0.16 +
  mutationProofScore * 0.17 +
  trustCalibrationScore * 0.12 +
  careLoopScore * 0.1 +
  explanationClarityScore * 0.05 +
  sessionPullScore * 0.05
);
const status =
  readinessScore >= 0.8
    ? 'ready'
    : readinessScore >= 0.45
      ? 'partial'
      : 'blocked';

const weakestArea = [
  ['ownership', ownershipScore],
  ['trainingProof', trainingProofScore],
  ['transformation', transformationScore],
  ['mutationProof', mutationProofScore],
  ['trustCalibration', trustCalibrationScore],
  ['careLoop', careLoopScore],
  ['explanationClarity', explanationClarityScore],
  ['sessionPull', sessionPullScore],
].sort((left, right) => left[1] - right[1])[0]?.[0] ?? 'unknown';

const report = {
  type: 'raising-eval',
  status,
  score: readinessScore,
  checkedAt: new Date().toISOString(),
  scores: {
    ownership: ownershipScore,
    trainingProof: trainingProofScore,
    transformation: transformationScore,
    mutationProof: mutationProofScore,
    trustCalibration: trustCalibrationScore,
    careLoop: careLoopScore,
    explanationClarity: explanationClarityScore,
    sessionPull: sessionPullScore,
  },
  checks: {
    ownership: ownershipChecks,
    trainingProof: trainingProofChecks,
    transformation: transformationChecks,
    mutationProof: mutationProofChecks,
    trustCalibration: trustCalibrationChecks,
    careLoop: careLoopChecks,
    explanationClarity: explanationClarityChecks,
    sessionPull: sessionPullChecks,
  },
  notes: [
    `Weakest area: ${weakestArea}.`,
    transformationScore < 0.75
      ? 'Visible companion transformation is still underbuilt or only partially specified.'
      : 'Visible companion transformation is becoming legible.',
    careLoopScore < 0.75
      ? 'The return loop still needs a stronger journal or return-pressure surface, not just more training knobs.'
      : 'The care loop is becoming legible as a judgment-native return reason.',
    mutationProofScore < 0.75 || trustCalibrationScore < 0.75
      ? 'The Atlas-style evolution loop is still underbuilt until mutation review, trust shifts, and proven-frame proof are surfaced in the runtime.'
      : 'The evolution loop is becoming visible as a keep-or-revert creature-training system.',
  ],
};

const paths = writeReport('raising-eval', report);
console.log(JSON.stringify({
  status: report.status,
  score: report.score,
  latestReport: paths.latestPath,
}, null, 2));
