import { writable } from 'svelte/store';
import { AIMON_DEX, DEFAULT_TEAM_DEX_IDS } from '../data/aimonDex';
import type { BattleResult, PlayerProgress } from '../types';

const STORAGE_KEY = 'aimon.player.progress.v1';

const defaultState: PlayerProgress = {
  xp: 0,
  researchPoints: 0,
  battleCount: 0,
  wins: 0,
  unlockedDexIds: AIMON_DEX.map((entry) => entry.id),
  teamDexIds: [...DEFAULT_TEAM_DEX_IDS]
};

function loadState(): PlayerProgress {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      unlockedDexIds: Array.isArray(parsed?.unlockedDexIds) ? parsed.unlockedDexIds : defaultState.unlockedDexIds,
      teamDexIds:
        Array.isArray(parsed?.teamDexIds) && parsed.teamDexIds.length > 0
          ? parsed.teamDexIds.slice(0, 4)
          : defaultState.teamDexIds
    };
  } catch {
    return defaultState;
  }
}

export const playerStore = writable<PlayerProgress>(loadState());

if (typeof window !== 'undefined') {
  playerStore.subscribe((state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });
}

export function toggleTeamDexId(dexId: string): void {
  playerStore.update((state) => {
    const exists = state.teamDexIds.includes(dexId);
    if (exists) {
      return {
        ...state,
        teamDexIds: state.teamDexIds.filter((id) => id !== dexId)
      };
    }

    if (state.teamDexIds.length >= 4) {
      return {
        ...state,
        teamDexIds: [...state.teamDexIds.slice(1), dexId]
      };
    }

    return {
      ...state,
      teamDexIds: [...state.teamDexIds, dexId]
    };
  });
}

export function applyBattleRewards(result: BattleResult): void {
  playerStore.update((state) => ({
    ...state,
    xp: state.xp + result.xpGain,
    researchPoints: state.researchPoints + result.researchGain,
    battleCount: state.battleCount + 1,
    wins: state.wins + (result.outcome === 'WIN' ? 1 : 0)
  }));
}

