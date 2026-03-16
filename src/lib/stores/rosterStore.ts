import { get } from 'svelte/store';
import { starterAgents } from '$lib/data/seed';
import { buildBattleWriteback, buildTrainingWriteback } from '$lib/services/memory/writeback';
import { persistedWritable } from '$lib/stores/persisted';
import type {
  AgentMemoryCard,
  CareState,
  EvalComparison,
  HubCareAction,
  HubStyle,
  MutationDecision,
  OwnedAgent,
  RosterState,
  TrainingLoadout,
} from '$lib/types';

const initialState: RosterState = {
  agents: starterAgents,
  selectedAgentId: starterAgents[0]?.id ?? '',
  recentComparisons: [],
};

function updateAgent<TAgent extends { id: string }>(
  agents: TAgent[],
  agentId: string,
  updater: (agent: TAgent) => TAgent,
): TAgent[] {
  return agents.map((agent) => (agent.id === agentId ? updater(agent) : agent));
}

function defaultHomeStyleForRole(role: OwnedAgent['role']): HubStyle {
  if (role === 'SCOUT') {
    return 'field';
  }
  if (role === 'ANALYST') {
    return 'archive';
  }
  return 'proof';
}

function defaultCareModeForState(careState: CareState): HubCareAction {
  if (careState === 'MEMORY_DRIFT' || careState === 'DOCTRINE_BLUR') {
    return 'note';
  }
  if (careState === 'CONFIDENCE_SHAKE' || careState === 'SQUAD_FRICTION') {
    return 'rest';
  }
  return 'gift';
}

function reconcileAgent(agent: OwnedAgent): OwnedAgent {
  return {
    ...agent,
    homeStyle: agent.homeStyle ?? defaultHomeStyleForRole(agent.role),
    lastCareMode: agent.lastCareMode ?? defaultCareModeForState(agent.careState),
    recentCareSummary: agent.recentCareSummary ?? 'No fresh home care action recorded yet.',
  };
}

function reconcileRosterState(state: RosterState): RosterState {
  const savedAgents = new Map(state.agents.map((agent) => [agent.id, agent]));
  const starterIds = new Set(starterAgents.map((agent) => agent.id));
  const mergedAgents = starterAgents.map((starterAgent) =>
    reconcileAgent({
      ...starterAgent,
      ...savedAgents.get(starterAgent.id),
    }),
  );
  const extraAgents = state.agents.filter((agent) => !starterIds.has(agent.id)).map(reconcileAgent);
  const agents = [...mergedAgents, ...extraAgents];
  const selectedAgentId = agents.some((agent) => agent.id === state.selectedAgentId)
    ? state.selectedAgentId
    : agents[0]?.id ?? '';

  return {
    ...state,
    agents,
    selectedAgentId,
  };
}

function clampMeter(value: number, min = 0, max = 99): number {
  return Math.max(min, Math.min(max, value));
}

function mergeMemoryBank(currentMemoryBank: AgentMemoryCard[], nextMemory: AgentMemoryCard): AgentMemoryCard[] {
  const filtered = currentMemoryBank.filter((memory) => memory.id !== nextMemory.id && memory.title !== nextMemory.title);
  return [nextMemory, ...filtered].slice(0, 10);
}

function resolveCareStateAfterAction(careState: CareState, careMode: HubCareAction): CareState {
  if (careMode === 'gift') {
    return careState === 'CONFIDENCE_SHAKE' ? 'CLEAR' : careState;
  }
  if (careMode === 'rest') {
    return careState === 'CONFIDENCE_SHAKE' || careState === 'SQUAD_FRICTION' ? 'CLEAR' : careState;
  }
  return careState === 'MEMORY_DRIFT' || careState === 'DOCTRINE_BLUR' ? 'CLEAR' : careState;
}

function isTargetedCareAction(careState: CareState, careMode: HubCareAction): boolean {
  return resolveCareStateAfterAction(careState, careMode) !== careState;
}

function buildCareSummary(
  agent: OwnedAgent,
  careMode: HubCareAction,
  nextCareState: CareState,
  targetedAction: boolean,
): string {
  if (agent.careState === 'CLEAR' && !targetedAction) {
    return 'Nothing urgent needed repair, so this was only a light home pass before the next proof.';
  }
  if (careMode === 'gift') {
    if (nextCareState === 'CLEAR' && targetedAction) {
      return 'The gift softened the shake in the body and brought the bond line back to steady.';
    }
    return 'A small gift warmed the room, but the real fix still needs to happen in judgment space.';
  }
  if (careMode === 'rest') {
    if (nextCareState === 'CLEAR' && targetedAction) {
      return 'A quiet rest beat settled the posture and gave the squad rhythm room again.';
    }
    return 'The rest pass lowered tension, but the unresolved lesson still needs a cleaner answer.';
  }
  if (nextCareState === 'CLEAR' && targetedAction) {
    return 'The lesson note pinned the right memory in place and cleared the current drift.';
  }
  return 'A fresh note is attached, but the body still needs live proof before the feeling fully changes.';
}

function buildNextCareAction(
  agent: OwnedAgent,
  careMode: HubCareAction,
  nextCareState: CareState,
  targetedAction: boolean,
): string {
  if (!targetedAction && agent.careState !== 'CLEAR') {
    return agent.nextCareAction;
  }
  if (!targetedAction) {
    return 'No urgent repair is active. Hold this form and wait for the next proof to reveal a real need.';
  }
  if (nextCareState === 'CLEAR') {
    if (careMode === 'gift') {
      return 'Bond is warmer now. Bank it with one calm proof before changing anything else.';
    }
    if (careMode === 'rest') {
      return 'The room is steady again. Take one controlled rerun before pushing the pace back up.';
    }
    return 'The lesson is pinned. Carry it into one clean proof before editing doctrine again.';
  }

  if (careMode === 'gift') {
    if (nextCareState === 'MEMORY_DRIFT' || nextCareState === 'DOCTRINE_BLUR') {
      return 'Warmth helped, but this still needs a note-led cleanup before the next deploy.';
    }
    return 'Bond improved, but the squad still needs a slower rest cycle before the next field run.';
  }
  if (careMode === 'rest') {
    if (nextCareState === 'MEMORY_DRIFT' || nextCareState === 'DOCTRINE_BLUR') {
      return 'The body calmed down, but the lesson still needs to be written cleanly before deploy.';
    }
    return 'Rest took the edge off, but this form still wants one safer spar before it is trusted.';
  }
  return 'The lesson is visible now, but confidence still needs a steadier field repetition to hold.';
}

function buildHomeNoteMemory(agent: OwnedAgent): AgentMemoryCard {
  return {
    id: `${agent.id}-home-note-${Date.now()}`,
    type: 'USER_NOTE',
    title: `Home note / ${agent.name}`,
    note: `${agent.recentLesson} ${agent.nextCareAction}`,
    tier: 'M30',
    source: 'DISTILL',
    createdAt: Date.now(),
  };
}

function applyCareWriteback(agent: OwnedAgent, careMode: HubCareAction): OwnedAgent {
  const nextCareState = resolveCareStateAfterAction(agent.careState, careMode);
  const targetedAction = isTargetedCareAction(agent.careState, careMode);
  const recentCareSummary = buildCareSummary(agent, careMode, nextCareState, targetedAction);
  const nextCareAction = buildNextCareAction(agent, careMode, nextCareState, targetedAction);
  const bondDelta =
    careMode === 'gift'
      ? targetedAction
        ? 3
        : agent.careState === 'CLEAR'
          ? 0
          : 1
      : careMode === 'rest'
        ? (targetedAction ? 1 : 0)
        : targetedAction
          ? 1
          : 0;
  const trustDelta = careMode === 'gift' ? (targetedAction ? 2 : 0) : careMode === 'rest' ? (targetedAction ? 3 : 0) : targetedAction ? 2 : 0;
  const nextMemoryBank =
    careMode === 'note' && targetedAction ? mergeMemoryBank(agent.memoryBank, buildHomeNoteMemory(agent)) : agent.memoryBank;

  return {
    ...agent,
    bond: clampMeter(agent.bond + bondDelta),
    trustWeight: clampMeter(agent.trustWeight + trustDelta, 20, 99),
    careState: nextCareState,
    lastCareMode: careMode,
    recentCareSummary,
    nextCareAction,
    memoryBank: nextMemoryBank,
  };
}

function createRosterStore() {
  const store = persistedWritable<RosterState>('cogochi.roster.v2', initialState);
  const { subscribe, update } = store;

  update((state) => reconcileRosterState(state));

  return {
    subscribe,
    selectAgent(agentId: string) {
      update((state) => ({ ...state, selectedAgentId: agentId }));
    },
    getAgent(agentId: string) {
      return get(store).agents.find((agent) => agent.id === agentId) ?? null;
    },
    setAgentHomeStyle(agentId: string, homeStyle: HubStyle) {
      update((state) => ({
        ...state,
        selectedAgentId: agentId,
        agents: updateAgent(state.agents, agentId, (agent) => ({
          ...agent,
          homeStyle,
        })),
      }));
    },
    applyCareAction(agentId: string, careMode: HubCareAction) {
      const state = get(store);
      const agent = state.agents.find((entry) => entry.id === agentId);
      if (!agent) {
        return null;
      }

      const nextAgent = applyCareWriteback(agent, careMode);

      update((currentState) => ({
        ...currentState,
        selectedAgentId: agentId,
        agents: updateAgent(currentState.agents, agentId, () => nextAgent),
      }));

      return {
        previousAgent: agent,
        nextAgent,
        careMode,
        targetedAction: agent.careState !== nextAgent.careState,
        resolved: agent.careState !== 'CLEAR' && nextAgent.careState === 'CLEAR',
      };
    },
    applyTraining(
      agentId: string,
      nextLoadout: TrainingLoadout,
      scenarioId: string,
      decisionOverride?: MutationDecision,
    ): EvalComparison | null {
      const state = get(store);
      const agent = state.agents.find((entry) => entry.id === agentId);
      if (!agent) {
        return null;
      }

      const { comparison, nextAgent } = buildTrainingWriteback(agent, nextLoadout, scenarioId, decisionOverride);

      update((currentState) => ({
        ...currentState,
        selectedAgentId: agentId,
        agents: updateAgent(currentState.agents, agentId, () => nextAgent),
        recentComparisons: [comparison, ...currentState.recentComparisons].slice(0, 8),
      }));

      return comparison;
    },
    applyBattleOutcome(
      agentId: string,
      scenarioId: string,
      outcome: 'WIN' | 'LOSS',
      entryFrameId: string | null,
      decisionOverride?: MutationDecision,
      doctrineSessionTitle?: string | null,
    ) {
      const state = get(store);
      const agent = state.agents.find((entry) => entry.id === agentId);
      if (!agent) {
        return null;
      }

      const { mutation, nextAgent } = buildBattleWriteback(agent, scenarioId, outcome, entryFrameId, decisionOverride, doctrineSessionTitle);

      update((currentState) => ({
        ...currentState,
        selectedAgentId: agentId,
        agents: updateAgent(currentState.agents, agentId, () => nextAgent),
      }));

      return {
        previousAgent: agent,
        nextAgent,
        mutation,
      };
    },
  };
}

export const rosterStore = createRosterStore();
