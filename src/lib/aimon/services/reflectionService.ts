import type {
  AgentDecisionTrace,
  AgentEvalResult,
  BattleResult,
  FailureMode,
  MemoryRecord,
  OwnedAgent,
  ReflectionNote,
  EvalScenario
} from '../types';

export interface ReflectionInput {
  scenario: EvalScenario;
  battleResult: BattleResult;
  agent: OwnedAgent;
  agentEval: Pick<AgentEvalResult, 'action' | 'confidence' | 'accuracyScore' | 'coordinationScore' | 'reasoningScore'>;
  decisionTrace?: AgentDecisionTrace;
  createdAt?: number;
}

export interface ReflectionOutput {
  note: ReflectionNote;
  durableMemory: MemoryRecord;
}

function verdictFromScores(input: ReflectionInput): ReflectionNote['verdict'] {
  const blended =
    input.agentEval.accuracyScore * 0.4 +
    input.agentEval.reasoningScore * 0.3 +
    input.agentEval.coordinationScore * 0.2 +
    (input.battleResult.outcome === 'WIN' ? 0.1 : input.battleResult.outcome === 'DRAW' ? 0.05 : -0.05);

  if (blended >= 0.7) return 'GOOD';
  if (blended >= 0.5) return 'MIXED';
  return 'BAD';
}

export function classifyFailureMode(input: ReflectionInput): FailureMode | null {
  const trace = input.decisionTrace;
  if (!trace) return 'PROVIDER_EMPTY_OUTPUT';

  const thesis = trace.thesis.toLowerCase();
  if (trace.fallbackUsed && thesis.includes('timeout')) return 'PROVIDER_TIMEOUT';
  if (trace.fallbackUsed) return 'JSON_SCHEMA_INVALID';
  if (input.agentEval.coordinationScore <= 0.4) return 'SQUAD_COORDINATION_BREAK';
  if (input.scenario.targetRegime === 'RANGE' && trace.action !== 'FLAT' && input.battleResult.outcome === 'LOSS') {
    return 'REGIME_MISMATCH';
  }
  if (trace.evidenceTitles.length === 0 && input.battleResult.outcome === 'LOSS') return 'RETRIEVAL_MISS';
  if (trace.evidenceTitles.length >= 3 && input.battleResult.outcome === 'LOSS') return 'RETRIEVAL_NOISE';
  if (input.agentEval.confidence >= 0.76 && input.battleResult.outcome === 'LOSS') return 'OVERCONFIDENCE';
  if (input.agentEval.confidence <= 0.42 && input.battleResult.outcome === 'WIN') return 'UNDERCONFIDENCE';
  if (input.agent.role === 'RISK' && input.battleResult.outcome === 'LOSS') return 'RISK_GUARD_BREACH';
  if (trace.evidenceTitles.length >= 2 && input.battleResult.outcome === 'LOSS') return 'EVIDENCE_CONFLICT_IGNORED';

  return null;
}

function buildLesson(input: ReflectionInput, failureMode: FailureMode | null, verdict: ReflectionNote['verdict']): string {
  if (verdict === 'GOOD') {
    return `${input.agent.name} matched the ${input.scenario.label} objective and should keep this pattern in the active playbook.`;
  }

  if (failureMode === 'OVERCONFIDENCE') {
    return `${input.agent.name} pushed too hard for the available evidence. Reduce confidence or require stronger confirmation before committing.`;
  }
  if (failureMode === 'UNDERCONFIDENCE') {
    return `${input.agent.name} was too passive despite aligned evidence. Loosen the confidence floor for this scenario family.`;
  }
  if (failureMode === 'REGIME_MISMATCH') {
    return `${input.agent.name} misread the regime and applied the wrong play style. Tighten regime detection before action selection.`;
  }
  if (failureMode === 'RETRIEVAL_MISS') {
    return `${input.agent.name} did not retrieve enough relevant memory. Increase retrieval quality for this scenario and role.`;
  }
  if (failureMode === 'RETRIEVAL_NOISE') {
    return `${input.agent.name} pulled too much noisy memory into context. Narrow the retrieval policy for this scenario.`;
  }
  if (failureMode === 'SQUAD_COORDINATION_BREAK') {
    return `${input.agent.name} diverged from the squad without producing a cleaner consensus. Improve role handoff and veto logic.`;
  }
  if (failureMode === 'RISK_GUARD_BREACH') {
    return `${input.agent.name} failed to protect the squad under adverse conditions. Strengthen guardrails and veto thresholds.`;
  }
  if (failureMode === 'JSON_SCHEMA_INVALID' || failureMode === 'PROVIDER_TIMEOUT' || failureMode === 'PROVIDER_EMPTY_OUTPUT') {
    return `${input.agent.name} needs a more reliable runtime path before this scenario can be trusted for promotion decisions.`;
  }

  return `${input.agent.name} produced a mixed read on ${input.scenario.label}. Review the thesis and evidence weighting before the next run.`;
}

function buildActionChange(failureMode: FailureMode | null): string | undefined {
  if (!failureMode) return undefined;

  switch (failureMode) {
    case 'OVERCONFIDENCE':
      return 'Lower confidence target by 0.1 for similar high-volatility setups.';
    case 'UNDERCONFIDENCE':
      return 'Raise the minimum conviction when regime and evidence align.';
    case 'REGIME_MISMATCH':
      return 'Add a stricter regime gate before directional actions.';
    case 'RETRIEVAL_MISS':
      return 'Increase successful memory weight or topK for this role.';
    case 'RETRIEVAL_NOISE':
      return 'Reduce topK or raise similarity thresholds for this role.';
    case 'RISK_GUARD_BREACH':
      return 'Promote the risk filter earlier in the decision path.';
    default:
      return undefined;
  }
}

export function buildReflectionNote(input: ReflectionInput): ReflectionNote {
  const createdAt = input.createdAt ?? Date.now();
  const failureMode = classifyFailureMode(input);
  const verdict = verdictFromScores(input);

  return {
    id: `reflection-${input.agent.id}-${createdAt}`,
    agentId: input.agent.id,
    scenarioId: input.scenario.id,
    verdict,
    failureMode,
    lesson: buildLesson(input, failureMode, verdict),
    actionChange: buildActionChange(failureMode),
    confidenceDelta:
      failureMode === 'OVERCONFIDENCE' ? -0.1 : failureMode === 'UNDERCONFIDENCE' ? 0.08 : undefined,
    retrievalDelta:
      failureMode === 'RETRIEVAL_MISS'
        ? 'Increase retrieval success weighting for this scenario family.'
        : failureMode === 'RETRIEVAL_NOISE'
          ? 'Reduce retrieval breadth and penalize noisy memory cards.'
          : undefined,
    promptDelta:
      failureMode === 'REGIME_MISMATCH'
        ? 'Add explicit regime confirmation language to the role prompt.'
        : failureMode === 'SQUAD_COORDINATION_BREAK'
          ? 'Clarify role handoff and consensus responsibilities.'
          : undefined,
    createdAt
  };
}

export function buildDurableMemoryRecord(input: ReflectionInput, note: ReflectionNote): MemoryRecord {
  const createdAt = note.createdAt;
  const trace = input.decisionTrace;
  const kind =
    note.verdict === 'GOOD'
      ? 'SUCCESS_CASE'
      : note.verdict === 'BAD'
        ? 'FAILURE_CASE'
        : 'MATCH_SUMMARY';

  return {
    id: `memory-reflection-${input.agent.id}-${createdAt}`,
    agentId: input.agent.id,
    kind,
    title: `${input.agent.name} ${kind === 'SUCCESS_CASE' ? 'playbook' : kind === 'FAILURE_CASE' ? 'failure review' : 'match recap'}`,
    summary: trace?.thesis ?? input.battleResult.note,
    lesson: note.lesson,
    tags: [
      input.scenario.id,
      input.scenario.symbol.toLowerCase(),
      input.agent.role.toLowerCase(),
      note.verdict.toLowerCase(),
      note.failureMode?.toLowerCase() ?? 'stable'
    ],
    role: input.agent.role,
    regime: input.scenario.targetRegime,
    symbol: input.scenario.symbol,
    timeframe: input.scenario.timeframe,
    sourceIds: ['eval-reflection'],
    successScore: note.verdict === 'GOOD' ? 0.82 : note.verdict === 'BAD' ? -0.68 : 0.18,
    importance: note.verdict === 'GOOD' || note.verdict === 'BAD' ? 0.72 : 0.56,
    retrievalCount: 0,
    createdAt
  };
}

export function reflectAgentEval(input: ReflectionInput): ReflectionOutput {
  const note = buildReflectionNote(input);
  return {
    note,
    durableMemory: buildDurableMemoryRecord(input, note)
  };
}

export function buildBattleReflections(
  scenario: EvalScenario,
  battleResult: BattleResult,
  agents: OwnedAgent[],
  agentEvalRows: Array<Pick<AgentEvalResult, 'agentId' | 'action' | 'confidence' | 'accuracyScore' | 'coordinationScore' | 'reasoningScore'>>,
  decisionTracesByAgent: Record<string, AgentDecisionTrace>,
  createdAt = Date.now()
): Record<string, ReflectionOutput> {
  return agents.reduce<Record<string, ReflectionOutput>>((acc, agent) => {
    const evalRow = agentEvalRows.find((row) => row.agentId === agent.id);
    if (!evalRow) return acc;

    acc[agent.id] = reflectAgentEval({
      scenario,
      battleResult,
      agent,
      agentEval: evalRow,
      decisionTrace: decisionTracesByAgent[agent.id],
      createdAt
    });

    return acc;
  }, {});
}
