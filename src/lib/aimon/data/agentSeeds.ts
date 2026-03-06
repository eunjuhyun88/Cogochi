import { AIMON_DEX, DEFAULT_TEAM_DEX_IDS } from './aimonDex';
import { DEFAULT_BASE_MODEL_ID } from './baseModels';
import { getTrainingProfile } from './trainingProfiles';
import type {
  AgentConfidenceStyle,
  AgentHorizon,
  AgentRole,
  AgentStatus,
  AiMonDexEntry,
  AiMonType,
  MemoryBank,
  MemoryRecord,
  OwnedAgent,
  Squad,
  SquadRoleMap,
  ToolKind,
  TrainingLoadout
} from '../types';

const ROLE_BY_TYPE: Record<AiMonType, AgentRole> = {
  Momentum: 'EXECUTOR',
  MeanReversion: 'RISK',
  Flow: 'SCOUT',
  Derivatives: 'ANALYST',
  Sentiment: 'ANALYST',
  Macro: 'RISK'
};

function getConfidenceStyle(type: AiMonType): AgentConfidenceStyle {
  if (type === 'Momentum' || type === 'Derivatives') return 'AGGRESSIVE';
  if (type === 'Macro' || type === 'MeanReversion') return 'CONSERVATIVE';
  return 'BALANCED';
}

function getHorizon(type: AiMonType): AgentHorizon {
  if (type === 'Momentum' || type === 'Derivatives') return 'SCALP';
  if (type === 'Macro') return 'SWING';
  return 'INTRADAY';
}

function getDefaultDataSourceIds(type: AiMonType): string[] {
  const shared = ['ds-price-core', 'ds-user-doctrine'];
  if (type === 'Macro') return [...shared, 'ds-macro-calendar', 'ds-news-brief'];
  if (type === 'Sentiment') return [...shared, 'ds-news-brief'];
  return [...shared, 'ds-news-brief'];
}

function getDefaultToolIds(role: AgentRole): string[] {
  const shared: ToolKind[] = ['RETRIEVER', 'SUMMARIZER'];
  if (role === 'RISK') {
    shared.push('RISK_FILTER');
  }

  return shared.map((kind) => {
    if (kind === 'RETRIEVER') return 'tool-retriever';
    if (kind === 'SUMMARIZER') return 'tool-summarizer';
    return 'tool-risk-filter';
  });
}

function buildRolePrompt(entry: AiMonDexEntry, role: AgentRole): string {
  switch (role) {
    case 'SCOUT':
      return `You are ${entry.name}, the scout. Surface early directional and regime clues before the rest of the squad commits.`;
    case 'ANALYST':
      return `You are ${entry.name}, the analyst. Convert raw signals into a coherent thesis with explicit evidence and uncertainty.`;
    case 'RISK':
      return `You are ${entry.name}, the risk lead. Block weak setups and keep the squad inside conservative downside limits.`;
    case 'EXECUTOR':
      return `You are ${entry.name}, the executor. Combine squad input into one final action and state a clear invalidation.`;
  }
}

function createLoadout(entry: AiMonDexEntry, role: AgentRole): TrainingLoadout {
  const profile = getTrainingProfile(entry.id);

  return {
    systemPrompt: `You are ${entry.name}, an owned Cogochi evaluation agent. Respond with concise market reasoning and structured outputs.`,
    rolePrompt: buildRolePrompt(entry, role),
    policyPrompt: profile.behavior,
    enabledDataSourceIds: getDefaultDataSourceIds(entry.type),
    enabledToolIds: getDefaultToolIds(role),
    riskTolerance: role === 'RISK' ? 0.22 : role === 'EXECUTOR' ? 0.62 : 0.45,
    confidenceStyle: getConfidenceStyle(entry.type),
    horizon: getHorizon(entry.type),
    retrievalPolicy: {
      topK: 3,
      recencyWeight: 0.15,
      similarityWeight: 0.45,
      successWeight: 0.15,
      importanceWeight: 0.1,
      roleMatchWeight: 0.1,
      regimeMatchWeight: 0.05
    },
    outputSchemaVersion: 'agent-decision.v1',
    retrainingPath: profile.retrainingPath,
    focusSkill: profile.focusSkill,
    indicators: [...profile.indicators],
    readout: profile.readout,
    behaviorNote: profile.behavior
  };
}

export function createOwnedAgentFromSpecies(entry: AiMonDexEntry, index: number, seedXp = 0): OwnedAgent {
  const role = ROLE_BY_TYPE[entry.type];
  const id = `starter-${String(index + 1).padStart(2, '0')}-${entry.id}`;
  const now = Date.now();

  return {
    id,
    speciesId: entry.id,
    name: entry.name,
    archetypeId: entry.id,
    baseModelId: DEFAULT_BASE_MODEL_ID,
    role,
    status: 'READY' satisfies AgentStatus,
    level: 1 + Math.floor(seedXp / 60),
    xp: seedXp,
    bond: 0,
    specializationTags: [entry.type, role, getTrainingProfile(entry.id).archetype],
    loadout: createLoadout(entry, role),
    memoryBankId: `memory-${id}`,
    record: {
      matches: 0,
      wins: 0,
      losses: 0,
      draws: 0
    },
    progression: {
      specializationTier: 1,
      unlockedToolIds: [],
      unlockedDataSourceIds: [],
      memoryCapacityBonus: 0
    },
    createdAt: now,
    updatedAt: now
  };
}

export function createStarterAgents(dexIds: string[] = AIMON_DEX.map((entry) => entry.id), seedXpBySpecies: Record<string, number> = {}): OwnedAgent[] {
  return dexIds
    .map((dexId) => AIMON_DEX.find((entry) => entry.id === dexId))
    .filter((entry): entry is AiMonDexEntry => Boolean(entry))
    .map((entry, index) => createOwnedAgentFromSpecies(entry, index, seedXpBySpecies[entry.id] ?? 0));
}

export function buildSquadRoleMap(agentIds: string[], agents: OwnedAgent[]): SquadRoleMap {
  const map: SquadRoleMap = {};

  for (const agentId of agentIds) {
    const agent = agents.find((item) => item.id === agentId);
    if (!agent) continue;

    if (agent.role === 'SCOUT' && !map.scout) map.scout = agent.id;
    if (agent.role === 'ANALYST' && !map.analyst) map.analyst = agent.id;
    if (agent.role === 'RISK' && !map.risk) map.risk = agent.id;
    if (agent.role === 'EXECUTOR' && !map.executor) map.executor = agent.id;
  }

  return map;
}

export function createStarterSquad(agents: OwnedAgent[]): Squad {
  const chosenIds = DEFAULT_TEAM_DEX_IDS
    .map((dexId) => agents.find((agent) => agent.speciesId === dexId)?.id)
    .filter((id): id is string => Boolean(id))
    .slice(0, 4);

  return {
    id: 'starter-squad',
    name: 'Starter Squad',
    memberAgentIds: chosenIds,
    roleMap: buildSquadRoleMap(chosenIds, agents),
    tacticPreset: 'BALANCED'
  };
}

function createStarterMemoryRecord(agent: OwnedAgent): MemoryRecord {
  return {
    id: `memory-record-${agent.id}-starter`,
    agentId: agent.id,
    kind: 'PLAYBOOK',
    title: `${agent.name} starter doctrine`,
    summary: agent.loadout.readout,
    lesson: agent.loadout.behaviorNote,
    tags: [agent.speciesId, agent.role, 'starter'],
    role: agent.role,
    regime: 'RANGE',
    symbol: 'BTCUSDT',
    timeframe: '15m',
    sourceIds: ['ds-user-doctrine'],
    successScore: 0.2,
    importance: 0.6,
    retrievalCount: 0,
    createdAt: agent.createdAt
  };
}

export function createStarterMemoryBanks(agents: OwnedAgent[]): MemoryBank[] {
  return agents.map((agent) => ({
    id: agent.memoryBankId,
    agentId: agent.id,
    capacity: 24 + agent.progression.memoryCapacityBonus,
    compactionLevel: 0,
    records: [createStarterMemoryRecord(agent)]
  }));
}
