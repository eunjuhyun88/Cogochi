import { aimonDexById } from '../data/aimonDex';

export function getEvolutionPreview(dexId: string, xp: number): {
  canEvolve: boolean;
  currentXp: number;
  requiredXp: number | null;
  evolvesTo: string | null;
} {
  const entry = aimonDexById[dexId];
  if (!entry || !entry.evolvesTo || !entry.evolvesAtXp) {
    return {
      canEvolve: false,
      currentXp: xp,
      requiredXp: null,
      evolvesTo: null
    };
  }

  return {
    canEvolve: xp >= entry.evolvesAtXp,
    currentXp: xp,
    requiredXp: entry.evolvesAtXp,
    evolvesTo: entry.evolvesTo
  };
}

