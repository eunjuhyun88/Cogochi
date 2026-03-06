import { writable } from 'svelte/store';
import type { BattleResult, PlayerProfile } from '../types';
import { DEFAULT_BASE_MODEL_ID } from '../data/baseModels';

const STORAGE_KEY = 'cogochi.player.v2';
const LEGACY_STORAGE_KEY = 'aimon.player.progress.v1';

const defaultState: PlayerProfile = {
  trainerLevel: 1,
  researchPoints: 0,
  battleCount: 0,
  wins: 0,
  unlockedSystems: ['roster', 'team', 'battle', 'lab'],
  activeBaseModelId: DEFAULT_BASE_MODEL_ID
};

function normalizeState(parsed: Partial<PlayerProfile> | null | undefined): PlayerProfile {
  return {
    trainerLevel:
      typeof parsed?.trainerLevel === 'number' && Number.isFinite(parsed.trainerLevel) && parsed.trainerLevel > 0
        ? Math.floor(parsed.trainerLevel)
        : defaultState.trainerLevel,
    researchPoints:
      typeof parsed?.researchPoints === 'number' && Number.isFinite(parsed.researchPoints)
        ? parsed.researchPoints
        : defaultState.researchPoints,
    battleCount:
      typeof parsed?.battleCount === 'number' && Number.isFinite(parsed.battleCount)
        ? parsed.battleCount
        : defaultState.battleCount,
    wins:
      typeof parsed?.wins === 'number' && Number.isFinite(parsed.wins) ? parsed.wins : defaultState.wins,
    unlockedSystems: Array.isArray(parsed?.unlockedSystems)
      ? parsed.unlockedSystems
      : defaultState.unlockedSystems,
    activeBaseModelId:
      typeof parsed?.activeBaseModelId === 'string' && parsed.activeBaseModelId.length > 0
        ? parsed.activeBaseModelId
        : defaultState.activeBaseModelId
  };
}

function migrateLegacyState(): PlayerProfile {
  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    const battleCount = typeof parsed?.battleCount === 'number' ? parsed.battleCount : 0;
    const trainerLevel = 1 + Math.floor((typeof parsed?.xp === 'number' ? parsed.xp : 0) / 120);

    return normalizeState({
      trainerLevel,
      researchPoints: typeof parsed?.researchPoints === 'number' ? parsed.researchPoints : 0,
      battleCount,
      wins: typeof parsed?.wins === 'number' ? parsed.wins : 0
    });
  } catch {
    return defaultState;
  }
}

function loadState(): PlayerProfile {
  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateLegacyState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return defaultState;
  }
}

export const playerStore = writable<PlayerProfile>(loadState());

if (typeof window !== 'undefined') {
  playerStore.subscribe((state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });
}

export function applyBattleRewards(result: BattleResult): void {
  playerStore.update((state) => {
    const battleCount = state.battleCount + 1;
    const wins = state.wins + (result.outcome === 'WIN' ? 1 : 0);

    return {
      ...state,
      researchPoints: state.researchPoints + result.researchGain,
      battleCount,
      wins,
      trainerLevel: 1 + Math.floor(battleCount / 5)
    };
  });
}
