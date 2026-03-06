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

export function createInitialMarketState(
  seed: Partial<
    Pick<
      MarketState,
      'price' | 'priceChange5m' | 'volatility' | 'fearGreed' | 'fundingRate' | 'openInterestChange' | 'regime'
    >
  > = {}
): MarketState {
  const base = {
    tick: 0,
    timestamp: Date.now(),
    price: seed.price ?? 97_500,
    priceChange5m: seed.priceChange5m ?? 0,
    volatility: seed.volatility ?? 0.22,
    fearGreed: seed.fearGreed ?? 54,
    fundingRate: seed.fundingRate ?? 0.0002,
    openInterestChange: seed.openInterestChange ?? 0.1
  };
  const computed = computeRegime(base);

  return {
    ...base,
    regime: seed.regime ?? computed.regime,
    regimeStrength: computed.regimeStrength
  };
}
