import { get, writable } from 'svelte/store';
import { BASE_MODELS } from '../data/baseModels';
import { createStarterAgents, createStarterMemoryBanks } from '../data/agentSeeds';
import { DEFAULT_DATA_SOURCES, DEFAULT_TOOLS } from '../data/labCatalog';
import { rosterStore } from './rosterStore';
import type { LabState, MemoryBank, MemoryRecord, PromptVariant, TrainingDatasetBundle, TrainingRun, TrainingRunType } from '../types';

const STORAGE_KEY = 'cogochi.lab.v2';

function defaultState(): LabState {
  const starterAgents = createStarterAgents();
  return {
    baseModels: BASE_MODELS,
    dataSources: DEFAULT_DATA_SOURCES,
    tools: DEFAULT_TOOLS,
    memoryBanks: createStarterMemoryBanks(starterAgents),
    trainingRuns: [],
    promptVariants: [],
    datasetBundles: []
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
      promptVariants: Array.isArray(parsed?.promptVariants) ? parsed.promptVariants : [],
      datasetBundles: Array.isArray(parsed?.datasetBundles) ? parsed.datasetBundles : []
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

export function appendMemoryRecords(records: MemoryRecord[]): MemoryRecord[] {
  if (records.length === 0) return [];

  labStore.update((state) => {
    const rosterAgents = get(rosterStore).agents;
    let next = state;

    for (const record of records) {
      const agent = rosterAgents.find((item) => item.id === record.agentId);
      if (!agent) continue;
      next = ensureMemoryBank(next, agent.id, agent.memoryBankId);
    }

    const grouped = records.reduce<Record<string, MemoryRecord[]>>((acc, record) => {
      acc[record.agentId] = [...(acc[record.agentId] ?? []), record];
      return acc;
    }, {});

    return {
      ...next,
      memoryBanks: next.memoryBanks.map((bank) =>
        grouped[bank.agentId]
          ? {
              ...bank,
              records: [...grouped[bank.agentId], ...bank.records].slice(0, bank.capacity)
            }
          : bank
      )
    };
  });

  return records;
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

export function appendDatasetBundle(bundle: TrainingDatasetBundle): void {
  labStore.update((state) => ({
    ...state,
    datasetBundles: [bundle, ...state.datasetBundles.filter((item) => item.id !== bundle.id)].slice(0, 48)
  }));
}
