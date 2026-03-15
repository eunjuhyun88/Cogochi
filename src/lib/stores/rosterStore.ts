import { get } from 'svelte/store';
import { starterAgents } from '$lib/data/seed';
import { buildBattleWriteback, buildTrainingWriteback } from '$lib/services/memory/writeback';
import { persistedWritable } from '$lib/stores/persisted';
import type { EvalComparison, MutationDecision, RosterState, TrainingLoadout } from '$lib/types';

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

function reconcileRosterState(state: RosterState): RosterState {
  const savedAgents = new Map(state.agents.map((agent) => [agent.id, agent]));
  const starterIds = new Set(starterAgents.map((agent) => agent.id));
  const mergedAgents = starterAgents.map((starterAgent) => ({
    ...starterAgent,
    ...savedAgents.get(starterAgent.id),
  }));
  const extraAgents = state.agents.filter((agent) => !starterIds.has(agent.id));
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
