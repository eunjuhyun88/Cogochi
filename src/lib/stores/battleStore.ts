import { get } from 'svelte/store';
import {
  createBattleSession,
  executeBattleCommand,
  moveBattleCommandSelection,
  selectBattleCommand,
} from '$lib/engine/battle-session';
import { persistedWritable } from '$lib/stores/persisted';
import type { BattleCommandId, BattleEntryGate, BattleState, OwnedAgent } from '$lib/types';

const initialState: BattleState = {
  session: null,
};

function createBattleStore() {
  const store = persistedWritable<BattleState>('cogochi.battle.v3', initialState);
  const { subscribe, update } = store;

  return {
    subscribe,
    ensureSession(
      agent: OwnedAgent,
      scenarioId: string,
      entryFrameId: string | null = null,
      entryGate: BattleEntryGate | null = 'DIRECT',
      doctrineSessionId: string | null = null,
      doctrineSessionTitle: string | null = null,
      doctrineSessionPackId: string | null = null,
    ) {
      update((state) => {
        if (
          state.session?.agentId === agent.id &&
          state.session.scenarioId === scenarioId &&
          state.session.entryFrameId === entryFrameId &&
          state.session.entryGate === (entryGate ?? 'DIRECT') &&
          state.session.doctrineSessionId === doctrineSessionId &&
          state.session.doctrineSessionTitle === doctrineSessionTitle &&
          state.session.doctrineSessionPackId === doctrineSessionPackId
        ) {
          return state;
        }
        return {
          session: createBattleSession(agent, scenarioId, entryFrameId, entryGate, doctrineSessionId, doctrineSessionTitle, doctrineSessionPackId),
        };
      });
    },
    reset(
      agent: OwnedAgent,
      scenarioId: string,
      entryFrameId: string | null = null,
      entryGate: BattleEntryGate | null = 'DIRECT',
      doctrineSessionId: string | null = null,
      doctrineSessionTitle: string | null = null,
      doctrineSessionPackId: string | null = null,
    ) {
      update(() => ({
        session: createBattleSession(agent, scenarioId, entryFrameId, entryGate, doctrineSessionId, doctrineSessionTitle, doctrineSessionPackId),
      }));
    },
    selectCommand(commandId: BattleCommandId) {
      update((state) => ({
        session: state.session ? selectBattleCommand(state.session, commandId) : null,
      }));
    },
    moveSelection(direction: 'left' | 'right' | 'up' | 'down') {
      update((state) => ({
        session: state.session ? moveBattleCommandSelection(state.session, direction) : null,
      }));
    },
    execute(agent: OwnedAgent) {
      update((state) => ({
        session: state.session ? executeBattleCommand(state.session, agent) : null,
      }));
      return get(store).session;
    },
    markWritebackApplied(proofArtifactId: string | null = null) {
      update((state) => ({
        session: state.session
          ? {
              ...state.session,
              writebackApplied: true,
              proofArtifactId,
            }
          : null,
      }));
    },
  };
}

export const battleStore = createBattleStore();
