import type {
  AgentAction,
  AgentDecisionTrace,
  AgentEvalResult,
  BattleOutcome,
  BattleResult,
  EvalMatchResult,
  EvalMetrics,
  EvalScenario,
  OwnedAgent,
  ReflectionNote,
  RewardPacket
} from '../types';

export interface SquadConsensus {
  finalAction: AgentAction;
  finalConfidence: number;
  vetoApplied: boolean;
  executorAgentId: string | null;
  rationale: string;
}

export interface BuildEvalMatchResultInput {
  scenario: EvalScenario;
  battleResult: BattleResult;
  agents: OwnedAgent[];
  decisionTracesByAgent: Record<string, AgentDecisionTrace>;
  memoryWritesByAgent?: Record<string, AgentEvalResult['memoryWrites']>;
  reflectionsByAgent?: Record<string, ReflectionNote>;
  squadId?: string;
  createdAt?: number;
}

export interface PromotionCandidateComparison {
  benchmarkPackId: string;
  baselineArtifactId?: string;
  candidateArtifactId?: string;
  passed: boolean;
  reasons: string[];
  deltas: {
    total: number;
    returnScore: number;
    riskScore: number;
    accuracyScore: number;
    calibrationScore: number;
    reasoningScore: number;
    coordinationScore: number;
  };
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number): number {
  return Number(clamp(value).toFixed(2));
}

function roundSigned(value: number): number {
  return Number(value.toFixed(2));
}

function directionAligned(action: AgentAction, priceDeltaPct: number): boolean {
  if (action === 'LONG') return priceDeltaPct >= 0;
  if (action === 'SHORT') return priceDeltaPct < 0;
  return Math.abs(priceDeltaPct) < 0.55;
}

function buildRewardPacket(result: BattleResult, agents: OwnedAgent[]): RewardPacket {
  const agentXpGain: Record<string, number> = {};
  const agentBondGain: Record<string, number> = {};
  const baseXp = agents.length > 0 ? Math.floor(result.xpGain / agents.length) : 0;
  const remainder = agents.length > 0 ? result.xpGain % agents.length : 0;
  const bond = result.outcome === 'WIN' ? 3 : result.outcome === 'DRAW' ? 2 : 1;

  agents.forEach((agent, index) => {
    agentXpGain[agent.id] = baseXp + (index < remainder ? 1 : 0);
    agentBondGain[agent.id] = bond;
  });

  return {
    trainerResearchGain: result.researchGain,
    unlockProgressGain: result.outcome === 'WIN' ? 2 : 1,
    agentXpGain,
    agentBondGain
  };
}

function scoreReasoning(trace: AgentDecisionTrace | undefined): number {
  if (!trace) return 0.28;

  let score = 0.3;
  if (trace.thesis.trim().length >= 80) score += 0.18;
  else if (trace.thesis.trim().length >= 40) score += 0.1;

  if (trace.invalidation.trim().length >= 24) score += 0.16;
  else if (trace.invalidation.trim().length >= 12) score += 0.08;

  score += Math.min(0.24, trace.evidenceTitles.length * 0.08);
  if (trace.fallbackUsed) score -= 0.12;

  return normalize(score);
}

function scoreCalibration(action: AgentAction, confidence: number, priceDeltaPct: number): number {
  const aligned = directionAligned(action, priceDeltaPct);
  const target =
    action === 'FLAT'
      ? Math.abs(priceDeltaPct) < 0.55
        ? 0.58
        : 0.32
      : aligned
        ? 0.74
        : 0.28;

  return normalize(1 - Math.abs(confidence - target));
}

function scoreAccuracy(action: AgentAction, priceDeltaPct: number): number {
  if (action === 'FLAT') {
    return normalize(Math.abs(priceDeltaPct) < 0.55 ? 0.72 : 0.36);
  }

  return normalize(directionAligned(action, priceDeltaPct) ? 0.82 : 0.24);
}

export function resolveSquadConsensus(traces: AgentDecisionTrace[]): SquadConsensus {
  if (traces.length === 0) {
    return {
      finalAction: 'FLAT',
      finalConfidence: 0.4,
      vetoApplied: false,
      executorAgentId: null,
      rationale: 'No agent traces were available.'
    };
  }

  const executor = traces.find((trace) => trace.role === 'EXECUTOR') ?? traces[0];
  const riskTrace = traces.find((trace) => trace.role === 'RISK') ?? null;
  const weightedSignal = traces.reduce((total, trace) => {
    const direction = trace.action === 'LONG' ? 1 : trace.action === 'SHORT' ? -1 : 0;
    return total + direction * trace.confidence;
  }, 0);
  const majorityAction: AgentAction = weightedSignal > 0.18 ? 'LONG' : weightedSignal < -0.18 ? 'SHORT' : 'FLAT';
  const vetoApplied = riskTrace !== null && riskTrace.action === 'FLAT' && riskTrace.confidence >= 0.68 && majorityAction !== 'FLAT';

  const finalAction = vetoApplied ? 'FLAT' : executor.action !== 'FLAT' ? executor.action : majorityAction;
  const finalConfidence = normalize(
    traces.reduce((sum, trace) => sum + trace.confidence, 0) / Math.max(1, traces.length) - (vetoApplied ? 0.08 : 0)
  );

  return {
    finalAction,
    finalConfidence,
    vetoApplied,
    executorAgentId: executor.ownedAgentId,
    rationale: vetoApplied
      ? `Risk veto held the squad flat against ${majorityAction} pressure.`
      : `Executor ${executor.agentName} finalized ${finalAction} from the squad trace mix.`
  };
}

function scoreCoordination(trace: AgentDecisionTrace | undefined, consensus: SquadConsensus, outcome: BattleOutcome): number {
  if (!trace) return 0.25;

  let score = trace.action === consensus.finalAction ? 0.72 : 0.42;

  if (trace.role === 'RISK' && consensus.vetoApplied && trace.action === 'FLAT') {
    score += 0.12;
  }
  if (trace.role === 'EXECUTOR' && trace.ownedAgentId === consensus.executorAgentId) {
    score += 0.08;
  }
  if (outcome === 'WIN') score += 0.06;
  if (outcome === 'LOSS' && trace.action !== consensus.finalAction) score -= 0.08;

  return normalize(score);
}

export function scoreTeamMetrics(result: BattleResult, scenario: EvalScenario, traces: AgentDecisionTrace[]): EvalMetrics {
  const consensus = resolveSquadConsensus(traces);
  const perTraceAccuracy = traces.map((trace) => scoreAccuracy(trace.action, result.priceDeltaPct));
  const perTraceCalibration = traces.map((trace) => scoreCalibration(trace.action, trace.confidence, result.priceDeltaPct));
  const perTraceReasoning = traces.map((trace) => scoreReasoning(trace));
  const perTraceCoordination = traces.map((trace) => scoreCoordination(trace, consensus, result.outcome));

  const accuracyScore = normalize(perTraceAccuracy.reduce((sum, value) => sum + value, 0) / Math.max(1, perTraceAccuracy.length));
  const calibrationScore = normalize(
    perTraceCalibration.reduce((sum, value) => sum + value, 0) / Math.max(1, perTraceCalibration.length)
  );
  const reasoningScore = normalize(
    perTraceReasoning.reduce((sum, value) => sum + value, 0) / Math.max(1, perTraceReasoning.length)
  );
  const coordinationScore = normalize(
    perTraceCoordination.reduce((sum, value) => sum + value, 0) / Math.max(1, perTraceCoordination.length)
  );
  const returnScore = normalize(0.5 + result.priceDeltaPct / 10);
  const riskScore = normalize(
    result.outcome === 'LOSS'
      ? scenario.targetRegime === 'RANGE'
        ? 0.4
        : 0.34
      : consensus.finalAction === 'FLAT'
        ? 0.76
        : scenario.targetRegime === 'RANGE'
          ? 0.7
          : 0.64
  );
  const weights = scenario.scoringWeights;
  const totalScore = normalize(
    returnScore * weights.returnWeight +
      riskScore * weights.riskWeight +
      accuracyScore * weights.accuracyWeight +
      calibrationScore * weights.calibrationWeight +
      reasoningScore * weights.reasoningWeight +
      coordinationScore * weights.coordinationWeight
  );

  return {
    returnScore,
    riskScore,
    accuracyScore,
    calibrationScore,
    reasoningScore,
    coordinationScore,
    totalScore
  };
}

function buildAgentEvalResult(
  agent: OwnedAgent,
  result: BattleResult,
  rewards: RewardPacket,
  teamMetrics: EvalMetrics,
  consensus: SquadConsensus,
  decisionTrace: AgentDecisionTrace | undefined,
  reflection: ReflectionNote | undefined,
  memoryWrites: AgentEvalResult['memoryWrites']
): AgentEvalResult {
  const action = decisionTrace?.action ?? consensus.finalAction;
  const confidence = decisionTrace?.confidence ?? consensus.finalConfidence;

  return {
    agentId: agent.id,
    action,
    confidence,
    accuracyScore: scoreAccuracy(action, result.priceDeltaPct),
    coordinationScore: scoreCoordination(decisionTrace, consensus, result.outcome),
    reasoningScore: scoreReasoning(decisionTrace),
    xpGain: rewards.agentXpGain[agent.id] ?? 0,
    bondGain: rewards.agentBondGain[agent.id] ?? 0,
    memoryWrites,
    reasoningSummary: decisionTrace?.thesis ?? reflection?.lesson ?? `Team score ${teamMetrics.totalScore.toFixed(2)}`,
    evidenceTitles: decisionTrace?.evidenceTitles ?? [],
    failureMode: reflection?.failureMode ?? null,
    reflection
  };
}

export function buildEvalMatchResult(input: BuildEvalMatchResultInput): EvalMatchResult {
  const createdAt = input.createdAt ?? Date.now();
  const traces = Object.values(input.decisionTracesByAgent);
  const consensus = resolveSquadConsensus(traces);
  const teamMetrics = scoreTeamMetrics(input.battleResult, input.scenario, traces);
  const rewards = buildRewardPacket(input.battleResult, input.agents);
  const agentResults = input.agents.map((agent) =>
    buildAgentEvalResult(
      agent,
      input.battleResult,
      rewards,
      teamMetrics,
      consensus,
      input.decisionTracesByAgent[agent.id],
      input.reflectionsByAgent?.[agent.id],
      input.memoryWritesByAgent?.[agent.id] ?? []
    )
  );
  const reflections = agentResults
    .map((result) => result.reflection)
    .filter((note): note is ReflectionNote => Boolean(note));

  return {
    id: `match-${createdAt}`,
    scenarioId: input.scenario.id,
    squadId: input.squadId ?? 'active-squad',
    outcome: input.battleResult.outcome,
    teamMetrics,
    agentResults,
    rewards,
    lessons: reflections.length > 0 ? reflections.map((note) => note.lesson) : [input.battleResult.note],
    reflections,
    createdAt
  };
}

export function comparePromotionCandidates(
  baseline: EvalMetrics,
  candidate: EvalMetrics,
  benchmarkPackId: string,
  baselineArtifactId?: string,
  candidateArtifactId?: string
): PromotionCandidateComparison {
  const deltas = {
    total: roundSigned(candidate.totalScore - baseline.totalScore),
    returnScore: roundSigned(candidate.returnScore - baseline.returnScore),
    riskScore: roundSigned(candidate.riskScore - baseline.riskScore),
    accuracyScore: roundSigned(candidate.accuracyScore - baseline.accuracyScore),
    calibrationScore: roundSigned(candidate.calibrationScore - baseline.calibrationScore),
    reasoningScore: roundSigned(candidate.reasoningScore - baseline.reasoningScore),
    coordinationScore: roundSigned(candidate.coordinationScore - baseline.coordinationScore)
  };

  const reasons: string[] = [];
  if (candidate.totalScore < baseline.totalScore + 0.02) reasons.push('Total score improvement below promotion gate.');
  if (candidate.riskScore < baseline.riskScore - 0.03) reasons.push('Risk score regressed beyond allowed tolerance.');
  if (candidate.reasoningScore < baseline.reasoningScore - 0.04) reasons.push('Reasoning score regressed beyond allowed tolerance.');
  if (candidate.calibrationScore < 0.55) reasons.push('Calibration score did not clear the minimum gate.');

  const softWins = [
    candidate.returnScore >= baseline.returnScore + 0.03,
    candidate.accuracyScore >= baseline.accuracyScore + 0.03,
    candidate.reasoningScore >= baseline.reasoningScore + 0.03,
    candidate.coordinationScore >= baseline.coordinationScore + 0.03
  ].filter(Boolean).length;

  if (reasons.length === 0 && softWins < 2) {
    reasons.push('Candidate did not secure enough soft-score advantages.');
  }

  return {
    benchmarkPackId,
    baselineArtifactId,
    candidateArtifactId,
    passed: reasons.length === 0,
    reasons,
    deltas
  };
}
