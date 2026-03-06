import { aimonDexById } from './aimonDex';
import type { TeamSynergySummary } from '../types';

export function summarizeTeamSynergy(dexIds: string[]): TeamSynergySummary {
  const entries = dexIds.map((id) => aimonDexById[id]).filter(Boolean);
  const uniqueTypes = new Set(entries.map((entry) => entry.type));
  const notes: string[] = [];
  let score = uniqueTypes.size * 20;

  if (entries.some((entry) => entry.type === 'Momentum') && entries.some((entry) => entry.type === 'Macro')) {
    score += 10;
    notes.push('Momentum + Macro: 추세 레짐에서 오브 생성 가속');
  }

  if (entries.some((entry) => entry.type === 'Flow') && entries.some((entry) => entry.type === 'Sentiment')) {
    score += 8;
    notes.push('Flow + Sentiment: 군중 신호 보정');
  }

  if (entries.some((entry) => entry.type === 'MeanReversion') && entries.some((entry) => entry.type === 'Derivatives')) {
    score += 6;
    notes.push('MeanReversion + Derivatives: 급변 구간 역습 보너스');
  }

  if (uniqueTypes.size <= 2) {
    score -= 12;
    notes.push('타입 다양성이 낮아 대응 폭이 좁음');
  }

  if (notes.length === 0) {
    notes.push('균형형 편성. 안정적이지만 폭발력은 낮음');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    notes
  };
}

