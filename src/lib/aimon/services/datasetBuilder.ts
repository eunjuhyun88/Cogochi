import type {
  AgentAction,
  AgentContextPacket,
  AgentDecisionTrace,
  AgentEvalResult,
  EvalMatchResult,
  FailureMode,
  PreferenceTrainingExample,
  ReflectionNote,
  SftTrainingExample,
  TrainingDatasetBundle
} from '../types';

interface SplitRatios {
  train: number;
  valid: number;
  test: number;
}

const DEFAULT_SPLIT_RATIOS: SplitRatios = {
  train: 0.7,
  valid: 0.2,
  test: 0.1
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function benchmarkPackIdForScenario(scenarioId: string): string {
  return `benchmark-${scenarioId}`;
}

function buildSystemMessage(context: AgentContextPacket): string {
  return [
    'You are training an AIMON decision agent.',
    `Role: ${context.role}`,
    `Base model: ${context.baseModelId}`,
    `Output schema: ${context.outputSchemaVersion}`,
    '',
    'System prompt:',
    context.policy.systemPrompt,
    '',
    'Role prompt:',
    context.policy.rolePrompt,
    '',
    'Policy prompt:',
    context.policy.policyPrompt
  ].join('\n');
}

function buildUserMessage(context: AgentContextPacket): string {
  const evidence =
    context.scenario.evidence.length > 0
      ? context.scenario.evidence
          .map(
            (item) =>
              `- ${item.title} [${item.kind}] :: ${item.summary}${typeof item.score === 'number' ? ` :: quality=${item.score}` : ''}`
          )
          .join('\n')
      : '- none';
  const retrieved =
    context.retrievedMemories.length > 0
      ? context.retrievedMemories
          .map((item) => `- ${item.title} [${item.kind}] :: ${item.lesson} :: score=${item.score.toFixed(2)}`)
          .join('\n')
      : '- none';
  const squadNotes = context.squadNotes.length > 0 ? context.squadNotes.map((item) => `- ${item}`).join('\n') : '- none';

  return [
    'Scenario packet:',
    `- scenario: ${context.scenario.label} (${context.scenario.scenarioId})`,
    `- objective: ${context.scenario.objective}`,
    `- symbol/timeframe: ${context.scenario.symbol} ${context.scenario.timeframe}`,
    `- regime: ${context.scenario.market.regime}`,
    `- price: ${context.scenario.market.price}`,
    `- priceChange5m: ${context.scenario.market.priceChange5m}`,
    `- volatility: ${context.scenario.market.volatility}`,
    `- fearGreed: ${context.scenario.market.fearGreed}`,
    `- fundingRate: ${context.scenario.market.fundingRate}`,
    `- openInterestChange: ${context.scenario.market.openInterestChange}`,
    `- allowed data: ${context.scenario.allowedDataKinds.join(', ') || 'none'}`,
    `- active data: ${context.activeDataKinds.join(', ') || 'none'}`,
    `- disallowed data: ${context.disallowedDataKinds.join(', ') || 'none'}`,
    `- active tools: ${context.activeToolIds.join(', ') || 'none'}`,
    '',
    'Evidence:',
    evidence,
    '',
    'Retrieved memories:',
    retrieved,
    '',
    'Squad notes:',
    squadNotes,
    '',
    'Return a JSON decision trace with action, confidence, thesis, invalidation, and evidenceTitles.'
  ].join('\n');
}

function serializeDecisionTrace(trace: AgentDecisionTrace): string {
  return JSON.stringify(
    {
      action: trace.action,
      confidence: Number(trace.confidence.toFixed(2)),
      thesis: trace.thesis,
      invalidation: trace.invalidation,
      evidenceTitles: trace.evidenceTitles
    },
    null,
    2
  );
}

function deriveMarketAlignedAction(context: AgentContextPacket): AgentAction {
  const delta = context.scenario.market.priceChange5m;
  if (Math.abs(delta) < 0.55) return 'FLAT';
  return delta >= 0 ? 'LONG' : 'SHORT';
}

function roundConfidence(value: number): number {
  return Number(clamp(value, 0.2, 0.95).toFixed(2));
}

function buildTraceFromEval(
  context: AgentContextPacket,
  agentEval: AgentEvalResult,
  reflection: ReflectionNote | undefined,
  createdAt: number
): AgentDecisionTrace {
  return {
    ownedAgentId: agentEval.agentId,
    agentName: context.agentName,
    role: context.role,
    action: agentEval.action,
    confidence: roundConfidence(agentEval.confidence),
    thesis: agentEval.reasoningSummary ?? reflection?.lesson ?? `${context.agentName} decision trace`,
    invalidation:
      reflection?.actionChange ??
      `Invalidate when ${context.scenario.label} no longer matches ${context.scenario.objective.toLowerCase()}.`,
    evidenceTitles:
      agentEval.evidenceTitles && agentEval.evidenceTitles.length > 0
        ? [...agentEval.evidenceTitles]
        : context.scenario.evidence.slice(0, 2).map((item) => item.title),
    generatedAt: createdAt
  };
}

function buildPreferredTrace(
  context: AgentContextPacket,
  rejected: AgentDecisionTrace,
  reflection: ReflectionNote | undefined
): AgentDecisionTrace {
  if (!reflection || reflection.verdict === 'GOOD') return rejected;

  const marketAlignedAction = deriveMarketAlignedAction(context);
  let action = rejected.action;
  let confidence = rejected.confidence;

  switch (reflection.failureMode) {
    case 'OVERCONFIDENCE':
      confidence = roundConfidence(rejected.confidence + (reflection.confidenceDelta ?? -0.1));
      break;
    case 'UNDERCONFIDENCE':
      action = marketAlignedAction;
      confidence = roundConfidence(rejected.confidence + (reflection.confidenceDelta ?? 0.08));
      break;
    case 'REGIME_MISMATCH':
    case 'RETRIEVAL_MISS':
    case 'PROVIDER_TIMEOUT':
    case 'PROVIDER_EMPTY_OUTPUT':
    case 'JSON_SCHEMA_INVALID':
    case 'SQUAD_COORDINATION_BREAK':
    case 'EVIDENCE_CONFLICT_IGNORED':
    case 'TOOL_MISUSE':
    case 'POLICY_DOCTRINE_VIOLATION':
    case 'DATA_SCOPE_VIOLATION':
      action = marketAlignedAction;
      confidence = roundConfidence(0.62);
      break;
    case 'RETRIEVAL_NOISE':
    case 'RISK_GUARD_BREACH':
    case 'LATE_ENTRY':
    case 'EARLY_EXIT':
      action = 'FLAT';
      confidence = roundConfidence(0.56);
      break;
    default:
      break;
  }

  return {
    ...rejected,
    action,
    confidence,
    thesis: `Adjusted plan: ${reflection.lesson}`,
    invalidation:
      reflection.actionChange ??
      reflection.promptDelta ??
      `Invalidate if the retrieved evidence stops supporting ${action}.`,
    evidenceTitles:
      rejected.evidenceTitles.length > 0
        ? rejected.evidenceTitles
        : context.retrievedMemories.slice(0, 2).map((item) => item.title)
  };
}

function scoreSftQuality(
  matchResult: EvalMatchResult,
  agentEval: AgentEvalResult,
  reflection: ReflectionNote | undefined,
  preferredTrace: AgentDecisionTrace
): number {
  let score =
    agentEval.accuracyScore * 0.4 +
    agentEval.reasoningScore * 0.25 +
    agentEval.coordinationScore * 0.15 +
    (matchResult.outcome === 'WIN' ? 0.12 : matchResult.outcome === 'DRAW' ? 0.08 : 0.04);

  if (reflection?.verdict === 'GOOD') score += 0.08;
  if (reflection?.verdict === 'BAD') score -= 0.04;
  if (preferredTrace.action !== agentEval.action) score -= 0.03;

  return Number(clamp(score, 0.32, 0.98).toFixed(2));
}

function scorePreferenceQuality(reflection: ReflectionNote | undefined): number {
  let score = 0.58;
  if (reflection?.verdict === 'BAD') score += 0.12;
  if (reflection?.verdict === 'MIXED') score += 0.05;
  if (reflection?.failureMode) score += 0.05;
  return Number(clamp(score, 0.4, 0.92).toFixed(2));
}

function normalizeRatios(ratios: SplitRatios): SplitRatios {
  const total = ratios.train + ratios.valid + ratios.test;
  if (total <= 0) return DEFAULT_SPLIT_RATIOS;

  return {
    train: ratios.train / total,
    valid: ratios.valid / total,
    test: ratios.test / total
  };
}

function partitionExampleIds(exampleIds: string[], ratios: SplitRatios): Pick<TrainingDatasetBundle, 'trainIds' | 'validIds' | 'testIds'> {
  if (exampleIds.length <= 1) {
    return {
      trainIds: [...exampleIds],
      validIds: [],
      testIds: []
    };
  }

  const normalized = normalizeRatios(ratios);
  let trainCount = Math.max(1, Math.round(exampleIds.length * normalized.train));
  let validCount = exampleIds.length >= 3 ? Math.round(exampleIds.length * normalized.valid) : 0;
  let testCount = exampleIds.length >= 5 ? Math.round(exampleIds.length * normalized.test) : 0;

  while (trainCount + validCount + testCount > exampleIds.length) {
    if (testCount > 0) testCount -= 1;
    else if (validCount > 0) validCount -= 1;
    else trainCount -= 1;
  }

  while (trainCount + validCount + testCount < exampleIds.length) {
    trainCount += 1;
  }

  const trainIds = exampleIds.slice(0, trainCount);
  const validIds = exampleIds.slice(trainCount, trainCount + validCount);
  const testIds = exampleIds.slice(trainCount + validCount, trainCount + validCount + testCount);

  return {
    trainIds,
    validIds,
    testIds
  };
}

export function buildSftExample(
  context: AgentContextPacket,
  preferredOutput: AgentDecisionTrace,
  qualityScore: number
): SftTrainingExample {
  const createdAt = preferredOutput.generatedAt || Date.now();
  return {
    id: `sft-${context.agentId}-${createdAt}-${preferredOutput.action.toLowerCase()}`,
    agentId: context.agentId,
    scenarioId: context.scenario.scenarioId,
    benchmarkPackId: benchmarkPackIdForScenario(context.scenario.scenarioId),
    messages: [
      {
        role: 'system',
        content: buildSystemMessage(context)
      },
      {
        role: 'user',
        content: buildUserMessage(context)
      },
      {
        role: 'assistant',
        content: serializeDecisionTrace(preferredOutput)
      }
    ],
    qualityScore: Number(clamp(qualityScore, 0, 1).toFixed(2)),
    createdAt
  };
}

export function buildPreferenceExample(
  context: AgentContextPacket,
  chosen: AgentDecisionTrace,
  rejected: AgentDecisionTrace,
  failureMode: FailureMode
): PreferenceTrainingExample {
  const createdAt = chosen.generatedAt || Date.now();
  return {
    id: `pref-${context.agentId}-${createdAt}-${failureMode.toLowerCase()}`,
    agentId: context.agentId,
    scenarioId: context.scenario.scenarioId,
    benchmarkPackId: benchmarkPackIdForScenario(context.scenario.scenarioId),
    prompt: [buildSystemMessage(context), '', buildUserMessage(context)].join('\n'),
    chosen: serializeDecisionTrace(chosen),
    rejected: serializeDecisionTrace(rejected),
    failureMode,
    qualityScore: scorePreferenceQuality(undefined),
    createdAt
  };
}

export function buildDatasetFromEval(
  matchResult: EvalMatchResult,
  contextsByAgent: Record<string, AgentContextPacket>,
  reflectionsByAgent: Record<string, ReflectionNote>
): TrainingDatasetBundle {
  const sftExamples: SftTrainingExample[] = [];
  const preferenceExamples: PreferenceTrainingExample[] = [];

  for (const agentEval of matchResult.agentResults) {
    const context = contextsByAgent[agentEval.agentId];
    if (!context) continue;

    const reflection = reflectionsByAgent[agentEval.agentId] ?? agentEval.reflection;
    const rejected = buildTraceFromEval(context, agentEval, reflection, matchResult.createdAt);
    const preferred = buildPreferredTrace(context, rejected, reflection);
    const sftQuality = scoreSftQuality(matchResult, agentEval, reflection, preferred);

    sftExamples.push(buildSftExample(context, preferred, sftQuality));

    if (reflection?.failureMode) {
      const preference = buildPreferenceExample(context, preferred, rejected, reflection.failureMode);
      preferenceExamples.push({
        ...preference,
        qualityScore: scorePreferenceQuality(reflection)
      });
    }
  }

  const bundle: TrainingDatasetBundle = {
    id: `dataset-bundle-${matchResult.id}`,
    agentIds: [...new Set(matchResult.agentResults.map((result) => result.agentId))],
    benchmarkPackId: benchmarkPackIdForScenario(matchResult.scenarioId),
    sourceMatchId: matchResult.id,
    sftExamples,
    preferenceExamples,
    trainIds: [],
    validIds: [],
    testIds: [],
    createdAt: matchResult.createdAt
  };

  return splitDatasetBundle(bundle);
}

export function splitDatasetBundle(
  bundle: TrainingDatasetBundle,
  ratios: SplitRatios = DEFAULT_SPLIT_RATIOS
): TrainingDatasetBundle {
  const exampleIds = [...bundle.sftExamples.map((example) => example.id), ...bundle.preferenceExamples.map((example) => example.id)];
  const partitions = partitionExampleIds(exampleIds, ratios);

  return {
    ...bundle,
    ...partitions
  };
}
