import type { AiMonType, MarketRegime } from '../types';

export const TYPE_COLORS: Record<AiMonType, string> = {
  Momentum: '#ff6b35',
  MeanReversion: '#00e5ff',
  Flow: '#00ff88',
  Derivatives: '#7b2fff',
  Sentiment: '#ffd700',
  Macro: '#ff3355'
};

export const COUNTER_TYPES: Record<AiMonType, AiMonType> = {
  Momentum: 'MeanReversion',
  MeanReversion: 'Momentum',
  Flow: 'Sentiment',
  Derivatives: 'Macro',
  Sentiment: 'Flow',
  Macro: 'Derivatives'
};

export const REGIME_MULTIPLIER: Record<AiMonType, Record<MarketRegime, number>> = {
  Momentum: { TREND: 1.35, RANGE: 0.8 },
  MeanReversion: { TREND: 0.82, RANGE: 1.35 },
  Flow: { TREND: 1.1, RANGE: 1.0 },
  Derivatives: { TREND: 1.04, RANGE: 0.96 },
  Sentiment: { TREND: 0.92, RANGE: 1.05 },
  Macro: { TREND: 1.2, RANGE: 0.82 }
};

export function getCounterType(type: AiMonType): AiMonType {
  return COUNTER_TYPES[type];
}

export function getRegimeMultiplier(type: AiMonType, regime: MarketRegime): number {
  return REGIME_MULTIPLIER[type][regime] ?? 1;
}

