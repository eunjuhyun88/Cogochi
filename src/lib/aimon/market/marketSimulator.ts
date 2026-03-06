import { computeRegime, createInitialMarketState } from './marketState';
import type { MarketState } from '../types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randCentered(scale: number): number {
  return (Math.random() - 0.5) * scale;
}

export function createSimulatorState(seedPrice?: number): MarketState {
  return createInitialMarketState(seedPrice);
}

export function advanceMarketState(prev: MarketState): MarketState {
  const nextTick = prev.tick + 1;
  const regimeFlip = nextTick % 18 === 0 ? (Math.random() > 0.45 ? 1 : -1) : 0;
  const targetVolatility = prev.regime === 'TREND' ? 0.22 : 0.46;
  const volatility = clamp(targetVolatility + randCentered(0.08) + regimeFlip * 0.04, 0.12, 0.7);
  const directionalBias = prev.regime === 'TREND' ? 0.18 + randCentered(0.12) : randCentered(0.08);
  const priceDeltaPct = directionalBias + randCentered(volatility);
  const price = prev.price * (1 + priceDeltaPct / 100);
  const base = {
    tick: nextTick,
    timestamp: Date.now(),
    price,
    priceChange5m: clamp(prev.priceChange5m * 0.4 + priceDeltaPct * 0.6, -3.5, 3.5),
    volatility,
    fearGreed: clamp(prev.fearGreed + randCentered(7) + priceDeltaPct * 2.5, 10, 90),
    fundingRate: clamp(prev.fundingRate + randCentered(0.0002), -0.002, 0.002),
    openInterestChange: clamp(prev.openInterestChange * 0.3 + randCentered(1.2), -3, 3)
  };
  const regime = computeRegime(base);
  return {
    ...base,
    ...regime
  };
}

