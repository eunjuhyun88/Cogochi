import { get, writable } from 'svelte/store';
import { DEFAULT_EVAL_SCENARIO_ID, createEvalScenario } from '../data/evalScenarios';
import type { AgentDecisionTrace, BattlePhase, BattleResult, EvalMatchResult, EvalMetrics, EvalScenario, MatchState, MemoryRecord, OwnedAgent, RewardPacket } from '../types';

const STORAGE_KEY = 'cogochi.match-history.v2';

const defaultState: MatchState = {
  selectedScenarioId: DEFAULT_EVAL_SCENARIO_ID,
  activeScenario: null,
  currentPhase: 'IDLE',
  recentResults: []
};

function loadState(): MatchState {
  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      selectedScenarioId: typeof parsed?.selectedScenarioId === 'string' ? parsed.selectedScenarioId : DEFAULT_EVAL_SCENARIO_ID,
      activeScenario: parsed?.activeScenario ?? null,
      currentPhase: parsed?.currentPhase ?? 'IDLE',
      recentResults: Array.isArray(parsed?.recentResults) ? parsed.recentResults : []
    };
  } catch {
    return defaultState;
  }
}

export const matchStore = writable<MatchState>(loadState());

if (typeof window !== 'undefined') {
  matchStore.subscribe((state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });
}

export function selectEvalScenario(scenarioId: string): void {
  matchStore.update((state) => ({
    ...state,
    selectedScenarioId: scenarioId
  }));
}

export function beginLegacyMatch(): void {
  matchStore.update((state) => ({
    ...state,
    activeScenario: createEvalScenario(state.selectedScenarioId, Date.now()),
    currentPhase: 'OPEN'
  }));
}

export function syncMatchPhase(phase: BattlePhase): void {
  matchStore.update((state) => ({
    ...state,
    currentPhase: phase
  }));
}

function buildLegacyMetrics(result: BattleResult, scenario: EvalScenario): EvalMetrics {
  const directionScore = result.outcome === 'WIN' ? 0.8 : result.outcome === 'DRAW' ? 0.5 : 0.2;
  const riskScore = result.outcome === 'LOSS' ? 0.35 : scenario.targetRegime === 'RANGE' ? 0.72 : 0.65;
  const returnScore = Math.max(0, Math.min(1, 0.5 + result.priceDeltaPct / 10));
  const calibrationScore = result.outcome === 'WIN' ? 0.68 : result.outcome === 'DRAW' ? 0.55 : 0.38;
  const reasoningScore = result.outcome === 'WIN' ? 0.66 : result.outcome === 'DRAW' ? 0.54 : 0.42;
  const coordinationScore = result.outcome === 'WIN' ? 0.64 : result.outcome === 'DRAW' ? 0.5 : 0.4;
  const weights = scenario.scoringWeights;

  return {
    returnScore,
    riskScore,
    accuracyScore: directionScore,
    calibrationScore,
    reasoningScore,
    coordinationScore,
    totalScore: Number(
      (
        returnScore * weights.returnWeight +
        riskScore * weights.riskWeight +
        directionScore * weights.accuracyWeight +
        calibrationScore * weights.calibrationWeight +
        reasoningScore * weights.reasoningWeight +
        coordinationScore * weights.coordinationWeight
      ).toFixed(2)
    )
  };
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

export function recordLegacyBattleResult(
  result: BattleResult,
  agents: OwnedAgent[],
  memoryWritesByAgent: Record<string, MemoryRecord[]> = {},
  decisionTracesByAgent: Record<string, AgentDecisionTrace> = {}
): void {
  const state = get(matchStore);
  const activeScenario = state.activeScenario ?? createEvalScenario(state.selectedScenarioId, Date.now());
  const metrics = buildLegacyMetrics(result, activeScenario);
  const rewards = buildRewardPacket(result, agents);
  const createdAt = Date.now();

  const matchResult: EvalMatchResult = {
    id: `match-${createdAt}`,
    scenarioId: activeScenario.id,
    squadId: 'active-squad',
    outcome: result.outcome,
    teamMetrics: metrics,
    agentResults: agents.map((agent) => ({
      agentId: agent.id,
      action: decisionTracesByAgent[agent.id]?.action ?? (result.consensus >= 55 ? 'LONG' : result.consensus <= 45 ? 'SHORT' : 'FLAT'),
      confidence: decisionTracesByAgent[agent.id]?.confidence ?? Math.max(0.1, Math.min(0.95, result.consensus / 100)),
      accuracyScore: metrics.accuracyScore,
      coordinationScore: metrics.coordinationScore,
      reasoningScore: metrics.reasoningScore,
      xpGain: rewards.agentXpGain[agent.id] ?? 0,
      bondGain: rewards.agentBondGain[agent.id] ?? 0,
      memoryWrites: memoryWritesByAgent[agent.id] ?? [],
      reasoningSummary: decisionTracesByAgent[agent.id]?.thesis,
      evidenceTitles: decisionTracesByAgent[agent.id]?.evidenceTitles ?? []
    })),
    rewards,
    lessons: [result.note],
    createdAt
  };

  matchStore.update((state) => ({
    ...state,
    activeScenario: null,
    currentPhase: 'RESULT',
    recentResults: [matchResult, ...state.recentResults].slice(0, 20)
  }));
}
