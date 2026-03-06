import type { MarketRegime, MarketState } from '../types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeRegime(next: Omit<MarketState, 'regime' | 'regimeStrength'>): {
  regime: MarketRegime;
  regimeStrength: number;
} {
  const trendPressure = Math.abs(next.priceChange5m) + Math.abs(next.openInterestChange) * 0.5;
  const isTrend = trendPressure > 1.1 || next.volatility < 0.32;
  return {
    regime: isTrend ? 'TREND' : 'RANGE',
    regimeStrength: clamp(isTrend ? trendPressure / 2.2 : next.volatility / 0.8, 0.35, 1)
  };
}

export function createInitialMarketState(seedPrice = 97500): MarketState {
  return {
    tick: 0,
    timestamp: Date.now(),
    price: seedPrice,
    priceChange5m: 0,
    volatility: 0.22,
    fearGreed: 54,
    fundingRate: 0.0002,
    openInterestChange: 0.1,
    regime: 'RANGE',
    regimeStrength: 0.5
  };
}

