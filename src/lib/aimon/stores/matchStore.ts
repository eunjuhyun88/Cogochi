import { writable } from 'svelte/store';
import { DEFAULT_EVAL_SCENARIO_ID, createEvalScenario } from '../data/evalScenarios';
import type { BattlePhase, EvalMatchResult, MatchState } from '../types';

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

export function recordEvalMatchResult(matchResult: EvalMatchResult): void {
  matchStore.update((state) => ({
    ...state,
    activeScenario: null,
    currentPhase: 'RESULT',
    recentResults: [matchResult, ...state.recentResults].slice(0, 20)
  }));
}
