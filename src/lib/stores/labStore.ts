import { get } from 'svelte/store';
import { trainerSummarySeed } from '$lib/data/seed';
import { rosterStore } from '$lib/stores/rosterStore';
import { persistedWritable } from '$lib/stores/persisted';
import type { DoctrineSession, DoctrineTerminalResult, LabState, MutationDecision, TrainingLoadout } from '$lib/types';

function resolveActiveAgentId(agentId: string): string {
  const agents = get(rosterStore).agents;
  if (agents.some((agent) => agent.id === agentId)) {
    return agentId;
  }
  return agents.find((agent) => agent.family === 'DINO')?.id ?? agents[0]?.id ?? '';
}

const initialState: LabState = {
  activeAgentId: trainerSummarySeed.activeScenarioId ? resolveActiveAgentId('doux') : '',
  activeScenarioId: trainerSummarySeed.activeScenarioId,
  drafts: {},
  doctrineSessions: {},
  activeDoctrineSessionIds: {},
};

function cloneLoadout(loadout: TrainingLoadout): TrainingLoadout {
  return {
    ...loadout,
    enabledDataSourceKinds: [...loadout.enabledDataSourceKinds],
    enabledToolKinds: [...loadout.enabledToolKinds],
  };
}

function cloneDoctrineSession(session: DoctrineSession): DoctrineSession {
  return {
    ...session,
    criteriaSummary: [...session.criteriaSummary],
    explanation: [...session.explanation],
    evidenceFrames: session.evidenceFrames.map((frame) => ({ ...frame })),
    overlaySpec: {
      ...session.overlaySpec,
      layers: session.overlaySpec.layers.map((layer) => ({ ...layer })),
    },
    pineDraft: session.pineDraft
      ? {
          ...session.pineDraft,
          notes: [...session.pineDraft.notes],
        }
      : null,
    suggestedLoadout: {
      ...session.suggestedLoadout,
      enabledDataSourceKinds: session.suggestedLoadout.enabledDataSourceKinds
        ? [...session.suggestedLoadout.enabledDataSourceKinds]
        : undefined,
      enabledToolKinds: session.suggestedLoadout.enabledToolKinds ? [...session.suggestedLoadout.enabledToolKinds] : undefined,
    },
  };
}

function createLabStore() {
  const store = persistedWritable<LabState>('cogochi.lab.v2', initialState);
  const { subscribe, update } = store;

  update((state) => ({
    ...state,
    activeAgentId: resolveActiveAgentId(state.activeAgentId),
    doctrineSessions: state.doctrineSessions ?? {},
    activeDoctrineSessionIds: state.activeDoctrineSessionIds ?? {},
  }));

  return {
    subscribe,
    setActiveAgent(agentId: string) {
      update((state) => ({ ...state, activeAgentId: agentId }));
    },
    setActiveScenario(scenarioId: string) {
      update((state) => ({ ...state, activeScenarioId: scenarioId }));
    },
    ensureDraft(agentId: string) {
      const agent = rosterStore.getAgent(agentId);
      if (!agent) {
        return;
      }
      update((state) => {
        if (state.drafts[agentId]) {
          return { ...state, activeAgentId: agentId };
        }
        return {
          ...state,
          activeAgentId: agentId,
          drafts: {
            ...state.drafts,
            [agentId]: cloneLoadout(agent.loadout),
          },
        };
      });
    },
    patchDraft(agentId: string, patch: Partial<TrainingLoadout>) {
      const agent = rosterStore.getAgent(agentId);
      if (!agent) {
        return;
      }
      update((state) => {
        const draft = state.drafts[agentId] ?? cloneLoadout(agent.loadout);
        return {
          ...state,
          activeAgentId: agentId,
          drafts: {
            ...state.drafts,
            [agentId]: {
              ...draft,
              ...patch,
            },
          },
        };
      });
    },
    resetDraft(agentId: string) {
      const agent = rosterStore.getAgent(agentId);
      if (!agent) {
        return;
      }
      update((state) => ({
        ...state,
        activeAgentId: agentId,
        drafts: {
          ...state.drafts,
          [agentId]: cloneLoadout(agent.loadout),
        },
      }));
    },
    getDraft(agentId: string) {
      const state = get(store);
      const agent = rosterStore.getAgent(agentId);
      if (!agent) {
        return null;
      }
      return state.drafts[agentId] ?? cloneLoadout(agent.loadout);
    },
    getDoctrineSessions(agentId: string): DoctrineSession[] {
      const state = get(store);
      return (state.doctrineSessions[agentId] ?? []).map(cloneDoctrineSession);
    },
    getDoctrineSession(agentId: string, sessionId: string): DoctrineSession | null {
      const state = get(store);
      const session = (state.doctrineSessions[agentId] ?? []).find((candidate) => candidate.id === sessionId);
      return session ? cloneDoctrineSession(session) : null;
    },
    saveDoctrineSession(agentId: string, result: DoctrineTerminalResult): DoctrineSession {
      const session: DoctrineSession = {
        ...result,
        agentId,
        status: 'DRAFT',
        createdAt: Date.now(),
      };

      update((state) => {
        const currentSessions = state.doctrineSessions[agentId] ?? [];
        const nextSessions = [session, ...currentSessions.filter((candidate) => candidate.id !== session.id)].slice(0, 12);
        return {
          ...state,
          activeAgentId: agentId,
          doctrineSessions: {
            ...state.doctrineSessions,
            [agentId]: nextSessions,
          },
          activeDoctrineSessionIds: {
            ...state.activeDoctrineSessionIds,
            [agentId]: session.id,
          },
        };
      });

      return session;
    },
    setActiveDoctrineSession(agentId: string, sessionId: string) {
      update((state) => ({
        ...state,
        activeAgentId: agentId,
        activeDoctrineSessionIds: {
          ...state.activeDoctrineSessionIds,
          [agentId]: sessionId,
        },
      }));
    },
    bindDoctrineSession(agentId: string, sessionId: string): DoctrineSession | null {
      const agent = rosterStore.getAgent(agentId);
      if (!agent) {
        return null;
      }

      let boundSession: DoctrineSession | null = null;

      update((state) => {
        const currentSessions = state.doctrineSessions[agentId] ?? [];
        const session = currentSessions.find((candidate) => candidate.id === sessionId);
        if (!session) {
          return state;
        }

        boundSession = cloneDoctrineSession(session);
        const currentDraft = state.drafts[agentId] ?? cloneLoadout(agent.loadout);
        const nextDraft: TrainingLoadout = {
          ...currentDraft,
          ...session.suggestedLoadout,
        };

        return {
          ...state,
          activeAgentId: agentId,
          drafts: {
            ...state.drafts,
            [agentId]: nextDraft,
          },
          doctrineSessions: {
            ...state.doctrineSessions,
            [agentId]: currentSessions.map((candidate) =>
              candidate.id === sessionId
                ? {
                    ...candidate,
                    status: 'BOUND',
                  }
                : candidate,
            ),
          },
          activeDoctrineSessionIds: {
            ...state.activeDoctrineSessionIds,
            [agentId]: sessionId,
          },
        };
      });

      return boundSession;
    },
    commitDraft(agentId: string, decisionOverride?: MutationDecision) {
      const state = get(store);
      const draft = state.drafts[agentId];
      if (!draft) {
        return null;
      }
      const comparison = rosterStore.applyTraining(agentId, draft, state.activeScenarioId, decisionOverride);
      if (!comparison) {
        return null;
      }
      update((currentState) => ({
        ...currentState,
        drafts: {
          ...currentState.drafts,
          [agentId]: cloneLoadout(draft),
        },
      }));
      return comparison;
    },
  };
}

export const labStore = createLabStore();
