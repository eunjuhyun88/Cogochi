import { get, writable } from 'svelte/store';
import { BASE_MODELS } from '../data/baseModels';
import { createStarterAgents, createStarterMemoryBanks } from '../data/agentSeeds';
import { DEFAULT_DATA_SOURCES, DEFAULT_TOOLS } from '../data/labCatalog';
import { rosterStore } from './rosterStore';
import type { BattleResult, EvalScenario, LabState, MemoryBank, MemoryRecord, PromptVariant, TrainingRun, TrainingRunType } from '../types';

const STORAGE_KEY = 'cogochi.lab.v2';

function defaultState(): LabState {
  const starterAgents = createStarterAgents();
  return {
    baseModels: BASE_MODELS,
    dataSources: DEFAULT_DATA_SOURCES,
    tools: DEFAULT_TOOLS,
    memoryBanks: createStarterMemoryBanks(starterAgents),
    trainingRuns: [],
    promptVariants: []
  };
}

function normalizeMemoryBanks(rawBanks: unknown): MemoryBank[] {
  if (!Array.isArray(rawBanks)) return defaultState().memoryBanks;
  return rawBanks.filter((bank): bank is MemoryBank => Boolean(bank && typeof bank === 'object'));
}

function loadState(): LabState {
  if (typeof window === 'undefined') return defaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);

    return {
      baseModels: Array.isArray(parsed?.baseModels) && parsed.baseModels.length > 0 ? parsed.baseModels : BASE_MODELS,
      dataSources: Array.isArray(parsed?.dataSources) ? parsed.dataSources : DEFAULT_DATA_SOURCES,
      tools: Array.isArray(parsed?.tools) ? parsed.tools : DEFAULT_TOOLS,
      memoryBanks: normalizeMemoryBanks(parsed?.memoryBanks),
      trainingRuns: Array.isArray(parsed?.trainingRuns) ? parsed.trainingRuns : [],
      promptVariants: Array.isArray(parsed?.promptVariants) ? parsed.promptVariants : []
    };
  } catch {
    return defaultState();
  }
}

export const labStore = writable<LabState>(loadState());

if (typeof window !== 'undefined') {
  labStore.subscribe((state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });
}

function ensureMemoryBank(state: LabState, agentId: string, memoryBankId: string): LabState {
  if (state.memoryBanks.some((bank) => bank.agentId === agentId || bank.id === memoryBankId)) return state;

  return {
    ...state,
    memoryBanks: [
      ...state.memoryBanks,
      {
        id: memoryBankId,
        agentId,
        capacity: 24,
        compactionLevel: 0,
        records: []
      }
    ]
  };
}

function createPromptVariant(agentId: string, label: string): PromptVariant | null {
  const agent = get(rosterStore).agents.find((item) => item.id === agentId);
  if (!agent) return null;

  return {
    id: `prompt-variant-${agentId}-${Date.now()}`,
    agentId,
    label,
    systemPrompt: agent.loadout.systemPrompt,
    rolePrompt: agent.loadout.rolePrompt,
    policyPrompt: agent.loadout.policyPrompt,
    createdAt: Date.now()
  };
}

function createTrainingRun(agentId: string, type: TrainingRunType, hypothesis: string, changes: string[]): TrainingRun {
  const now = Date.now();
  return {
    id: `training-run-${agentId}-${now}`,
    agentId,
    type,
    hypothesis,
    changes,
    beforeVersion: 'current',
    afterVersion: `${type.toLowerCase()}-${now}`,
    status: 'QUEUED',
    startedAt: now
  };
}

function createBattleMemory(
  agentId: string,
  result: BattleResult,
  scenario: Pick<EvalScenario, 'id' | 'symbol' | 'timeframe'> | null,
  regime: string,
  titlePrefix: string,
  role: MemoryRecord['role']
): MemoryRecord {
  const now = Date.now();

  return {
    id: `memory-record-${agentId}-${now}`,
    agentId,
    kind: result.outcome === 'WIN' ? 'SUCCESS_CASE' : result.outcome === 'LOSS' ? 'FAILURE_CASE' : 'MATCH_SUMMARY',
    title: `${titlePrefix} ${result.outcome}`,
    summary: result.note,
    lesson:
      result.outcome === 'WIN'
        ? 'This setup aligned with the scenario and should be retained as a repeatable pattern.'
        : result.outcome === 'LOSS'
          ? 'The setup misread the scenario and should be reviewed before the next run.'
          : 'The setup produced an inconclusive read and needs sharper evidence weighting.',
    tags: ['legacy-battle', scenario?.id ?? 'ad-hoc', result.outcome.toLowerCase(), regime.toLowerCase()],
    role,
    regime,
    symbol: scenario?.symbol ?? 'BTCUSDT',
    timeframe: scenario?.timeframe ?? '15m',
    sourceIds: ['ds-price-core'],
    successScore: result.outcome === 'WIN' ? 0.8 : result.outcome === 'DRAW' ? 0.2 : -0.6,
    importance: 0.6,
    retrievalCount: 0,
    createdAt: now
  };
}

export function appendBattleMemories(
  agentIds: string[],
  result: BattleResult,
  scenario: Pick<EvalScenario, 'id' | 'symbol' | 'timeframe'> | null,
  regime: string
): MemoryRecord[] {
  const uniqueIds = [...new Set(agentIds)];
  if (uniqueIds.length === 0) return [];
  const createdRecords: MemoryRecord[] = [];

  labStore.update((state) => {
    const rosterAgents = get(rosterStore).agents;
    let next = state;

    for (const agentId of uniqueIds) {
      const agent = rosterAgents.find((item) => item.id === agentId);
      if (!agent) continue;
      next = ensureMemoryBank(next, agent.id, agent.memoryBankId);
    }

    const memoryBanks = next.memoryBanks.map((bank) => {
      if (!uniqueIds.includes(bank.agentId)) return bank;
      const agent = rosterAgents.find((item) => item.id === bank.agentId);
      const record = createBattleMemory(bank.agentId, result, scenario, regime, agent?.name ?? 'Agent', agent?.role ?? 'ANALYST');
      createdRecords.push(record);

      return {
        ...bank,
        records: [record, ...bank.records].slice(0, bank.capacity)
      };
    });

    return {
      ...next,
      memoryBanks
    };
  });

  return createdRecords;
}

export function savePromptVariantFromAgent(agentId: string, label: string): void {
  const variant = createPromptVariant(agentId, label);
  if (!variant) return;

  labStore.update((state) => ({
    ...state,
    promptVariants: [variant, ...state.promptVariants].slice(0, 16)
  }));
}

export function queueTrainingRun(agentId: string, type: TrainingRunType, hypothesis: string, changes: string[]): void {
  const run = createTrainingRun(agentId, type, hypothesis, changes);

  labStore.update((state) => ({
    ...state,
    trainingRuns: [run, ...state.trainingRuns].slice(0, 24)
  }));
}

export function compactMemoryBank(agentId: string): void {
  labStore.update((state) => ({
    ...state,
    memoryBanks: state.memoryBanks.map((bank) => {
      if (bank.agentId !== agentId) return bank;

      const keepCount = Math.max(8, Math.floor(bank.capacity / 2));
      const records = [...bank.records]
        .sort((left, right) => (right.importance + right.successScore * 0.15) - (left.importance + left.successScore * 0.15))
        .slice(0, keepCount);

      return {
        ...bank,
        compactionLevel: bank.compactionLevel + 1,
        records
      };
    })
  }));
}

export function addUserNoteMemory(agentId: string, title: string, lesson: string, tags: string[]): void {
  const agent = get(rosterStore).agents.find((item) => item.id === agentId);
  if (!agent) return;

  const now = Date.now();
  const record: MemoryRecord = {
    id: `memory-note-${agentId}-${now}`,
    agentId,
    kind: 'USER_NOTE',
    title,
    summary: lesson,
    lesson,
    tags,
    role: agent.role,
    regime: 'RANGE',
    symbol: 'BTCUSDT',
    timeframe: '15m',
    sourceIds: ['ds-user-doctrine'],
    successScore: 0,
    importance: 0.8,
    retrievalCount: 0,
    createdAt: now
  };

  labStore.update((state) => {
    const next = ensureMemoryBank(state, agent.id, agent.memoryBankId);
    return {
      ...next,
      memoryBanks: next.memoryBanks.map((bank) =>
        bank.agentId !== agent.id
          ? bank
          : {
              ...bank,
              records: [record, ...bank.records].slice(0, bank.capacity)
            }
      )
    };
  });
}
