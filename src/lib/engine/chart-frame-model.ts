import type { EvalScenario } from '$lib/types';

export interface ChartCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalChartFrame {
  id: string;
  title: string;
  shortLabel: string;
  dateLabel: string;
  note: string;
  startTime: number;
  symbol: string;
  timeframe: string;
  candles: ChartCandle[];
}

type FrameTone = 'bull' | 'bear' | 'flat';

export const chartFieldPadding = {
  left: 80,
  right: 132,
} as const;

const scenarioCloseTemplates: Record<EvalScenario['id'], number[]> = {
  'btc-support-reclaim': [96, 94, 92, 89, 86, 82, 79, 77, 78, 80, 83, 81, 84, 86, 88, 91, 93, 92, 95, 97],
  'eth-range-fakeout': [73, 74, 75, 77, 79, 82, 80, 77, 75, 76, 78, 79, 77, 74, 72, 71, 70, 69, 68, 67],
  'sol-breakout-ladder': [58, 59, 60, 61, 60, 62, 63, 64, 63, 65, 68, 72, 75, 79, 83, 88, 92, 96, 99, 103],
};

const btcHistoricalFrames: HistoricalChartFrame[] = [
  {
    id: 'china-crackdown-flush',
    title: 'China Crackdown Flush',
    shortLabel: 'May 19, 2021',
    dateLabel: 'May 19, 2021 · 12:00-13:45 UTC',
    note: 'Capitulation wick through the China mining crackdown panic.',
    startTime: 1621425600000,
    symbol: 'BTC',
    timeframe: '15m',
    candles: [
      { open: 38700.0, high: 39295.51, low: 38300.0, close: 38734.99, volume: 4010.09864 },
      { open: 38735.0, high: 38896.01, low: 38100.2, close: 38314.39, volume: 4007.94798 },
      { open: 38314.4, high: 38314.4, low: 36433.0, close: 36433.0, volume: 6069.93271 },
      { open: 36433.0, high: 37379.99, low: 32488.89, close: 35234.62, volume: 16858.54733 },
      { open: 35234.62, high: 36013.2, low: 30000.0, close: 32300.46, volume: 14488.0119 },
      { open: 32437.76, high: 35900.0, low: 32200.0, close: 33601.85, volume: 10894.73127 },
      { open: 33601.86, high: 37604.99, low: 33500.04, close: 37406.48, volume: 10115.50007 },
      { open: 37406.48, high: 38000.0, low: 34900.0, close: 35863.06, volume: 8741.56853 },
    ],
  },
  {
    id: 'ftx-collapse-flush',
    title: 'FTX Collapse Flush',
    shortLabel: 'Nov 9, 2022',
    dateLabel: 'November 9, 2022 · 14:00-15:45 UTC',
    note: 'Forced unwind after the FTX insolvency shock spread across majors.',
    startTime: 1668002400000,
    symbol: 'BTC',
    timeframe: '15m',
    candles: [
      { open: 17582.24, high: 17673.0, low: 17517.0, close: 17599.35, volume: 5728.54534 },
      { open: 17599.35, high: 17614.92, low: 17431.88, close: 17497.99, volume: 6717.25699 },
      { open: 17497.99, high: 17690.75, low: 17361.51, close: 17689.68, volume: 8578.37937 },
      { open: 17689.68, high: 17816.39, low: 17589.92, close: 17649.62, volume: 9504.84147 },
      { open: 17649.62, high: 17834.99, low: 17614.48, close: 17725.1, volume: 7450.81964 },
      { open: 17727.25, high: 17811.16, low: 17624.0, close: 17638.53, volume: 6919.82745 },
      { open: 17641.61, high: 17699.99, low: 16918.83, close: 17183.07, volume: 24205.60719 },
      { open: 17188.74, high: 17343.37, low: 17015.2, close: 17116.08, volume: 17368.64777 },
    ],
  },
  {
    id: 'bank-crisis-rebound',
    title: 'Bank Crisis Rebound',
    shortLabel: 'Mar 14, 2023',
    dateLabel: 'March 14, 2023 · 12:00-13:45 UTC',
    note: 'Risk snapped upward as US regional bank stress pushed traders back into BTC.',
    startTime: 1678795200000,
    symbol: 'BTC',
    timeframe: '15m',
    candles: [
      { open: 24743.05, high: 24890.0, low: 24682.11, close: 24702.98, volume: 11985.10509 },
      { open: 24701.07, high: 24772.72, low: 24617.66, close: 24639.76, volume: 8166.49033 },
      { open: 24644.8, high: 25500.0, low: 24458.04, close: 25457.68, volume: 29928.68193 },
      { open: 25458.37, high: 26025.0, low: 25315.36, close: 25832.57, volume: 29961.47469 },
      { open: 25832.57, high: 26386.87, low: 25828.75, close: 26228.21, volume: 22596.17667 },
      { open: 26228.21, high: 26274.77, low: 25667.99, close: 25863.37, volume: 17991.56623 },
      { open: 25863.37, high: 26071.76, low: 25836.01, close: 25898.14, volume: 12407.69904 },
      { open: 25898.14, high: 26013.74, low: 25588.0, close: 25759.64, volume: 13011.02858 },
    ],
  },
  {
    id: 'etf-headline-whipsaw',
    title: 'ETF Headline Whipsaw',
    shortLabel: 'Oct 24, 2023',
    dateLabel: 'October 24, 2023 · 02:00-03:45 UTC',
    note: 'The spot ETF headline spike turned into a sharp intraday whipsaw.',
    startTime: 1698112800000,
    symbol: 'BTC',
    timeframe: '15m',
    candles: [
      { open: 34190.93, high: 34607.06, low: 34124.66, close: 34445.6, volume: 2986.87635 },
      { open: 34445.59, high: 35280.0, low: 34385.02, close: 34789.38, volume: 5308.41481 },
      { open: 34789.38, high: 34956.62, low: 34473.8, close: 34741.66, volume: 2590.09859 },
      { open: 34741.66, high: 34912.1, low: 34555.69, close: 34569.45, volume: 2103.87377 },
      { open: 34569.45, high: 34722.01, low: 34440.0, close: 34680.93, volume: 1407.24537 },
      { open: 34680.93, high: 34700.0, low: 34555.0, close: 34619.29, volume: 1454.99139 },
      { open: 34619.29, high: 34710.0, low: 34460.0, close: 34484.87, volume: 2840.63725 },
      { open: 34484.88, high: 34504.3, low: 34033.12, close: 34061.6, volume: 2079.40144 },
    ],
  },
  {
    id: 'spot-etf-approval-whipsaw',
    title: 'Spot ETF Approval Whipsaw',
    shortLabel: 'Jan 10, 2024',
    dateLabel: 'January 10, 2024 · 21:00-22:45 UTC',
    note: 'Approval hit the tape and BTC ripped, flushed, then reclaimed in minutes.',
    startTime: 1704920400000,
    symbol: 'BTC',
    timeframe: '15m',
    candles: [
      { open: 46127.0, high: 46301.04, low: 45711.7, close: 46015.03, volume: 1971.27341 },
      { open: 46015.03, high: 46053.33, low: 45346.62, close: 45785.25, volume: 2199.67398 },
      { open: 45785.26, high: 45830.0, low: 45080.0, close: 45478.09, volume: 2215.19389 },
      { open: 45478.09, high: 45975.0, low: 45430.17, close: 45946.0, volume: 1756.68581 },
      { open: 45946.0, high: 46102.76, low: 45760.45, close: 46031.22, volume: 1383.14684 },
      { open: 46031.22, high: 46689.0, low: 46026.0, close: 46404.54, volume: 2930.29783 },
      { open: 46404.53, high: 46523.53, low: 46278.11, close: 46400.01, volume: 864.06414 },
      { open: 46400.02, high: 46948.98, low: 46400.0, close: 46902.69, volume: 1458.11414 },
    ],
  },
  {
    id: 'ath-sweep-reversal',
    title: 'ATH Sweep Reversal',
    shortLabel: 'Mar 5, 2024',
    dateLabel: 'March 5, 2024 · 14:00-15:45 UTC',
    note: 'A new all-time-high attempt got swept and violently rejected back under the spike.',
    startTime: 1709647200000,
    symbol: 'BTC',
    timeframe: '15m',
    candles: [
      { open: 67770.02, high: 67796.25, low: 67388.0, close: 67506.28, volume: 758.78527 },
      { open: 67506.28, high: 67677.64, low: 67244.0, close: 67576.02, volume: 828.33666 },
      { open: 67576.02, high: 68389.0, low: 67274.77, close: 68360.96, volume: 1448.6373 },
      { open: 68360.96, high: 68789.0, low: 68223.4, close: 68710.41, volume: 2621.90466 },
      { open: 68710.41, high: 69000.0, low: 67100.0, close: 68317.14, volume: 4213.10513 },
      { open: 68317.15, high: 68425.0, low: 67080.45, close: 67170.01, volume: 2203.196 },
      { open: 67170.02, high: 67389.13, low: 66370.0, close: 66858.39, volume: 2907.87007 },
      { open: 66858.4, high: 67380.0, low: 66761.23, close: 66773.05, volume: 1498.8414 },
    ],
  },
];

const scenarioReferenceFrameMap: Record<EvalScenario['id'], string> = {
  'btc-support-reclaim': 'bank-crisis-rebound',
  'eth-range-fakeout': 'etf-headline-whipsaw',
  'sol-breakout-ladder': 'spot-etf-approval-whipsaw',
};

const historicalFrameScenarioMap: Record<string, EvalScenario['id']> = {
  'china-crackdown-flush': 'eth-range-fakeout',
  'ftx-collapse-flush': 'eth-range-fakeout',
  'bank-crisis-rebound': 'btc-support-reclaim',
  'etf-headline-whipsaw': 'eth-range-fakeout',
  'spot-etf-approval-whipsaw': 'sol-breakout-ladder',
  'ath-sweep-reversal': 'eth-range-fakeout',
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function interpolateSeries(template: number[], length: number): number[] {
  if (length <= template.length) {
    return template.slice(0, length);
  }

  return Array.from({ length }, (_, index) => {
    const ratio = index / Math.max(1, length - 1);
    const scaledIndex = ratio * (template.length - 1);
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.min(template.length - 1, lowerIndex + 1);
    const blend = scaledIndex - lowerIndex;
    const lower = template[lowerIndex];
    const upper = template[upperIndex];
    return lower + (upper - lower) * blend;
  });
}

function buildCandles(closes: number[]): ChartCandle[] {
  return closes.map((close, index) => {
    const open = index === 0 ? close - 1.5 : closes[index - 1];
    const wick = 1.1 + (index % 3) * 0.55;
    const lowWick = index % 4 === 0 ? wick * 1.35 : wick * 0.9;
    return {
      open,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - lowWick,
      close,
      volume: Math.round(Math.abs(close - open) * 140 + 110 + (index % 5) * 28),
    };
  });
}

function chunkIntoFrames(scenario: EvalScenario, candles: ChartCandle[], candlesPerFrame: number): HistoricalChartFrame[] {
  const totalFrames = Math.ceil(candles.length / candlesPerFrame);
  return Array.from({ length: totalFrames }, (_, index) => {
    const start = index * candlesPerFrame;
    const end = Math.min(candles.length, start + candlesPerFrame);
    return {
      id: `${scenario.id}-frame-${index + 1}`,
      title: `${scenario.label} Frame ${index + 1}`,
      shortLabel: `Frame ${index + 1}`,
      dateLabel: `${scenario.symbol} ${scenario.timeframe} · frame ${index + 1}`,
      note: scenario.structureHint,
      startTime: index,
      symbol: scenario.symbol,
      timeframe: scenario.timeframe,
      candles: candles.slice(start, end),
    };
  });
}

export function buildScenarioCandles(scenarioId: EvalScenario['id'], length = 20): ChartCandle[] {
  const template = scenarioCloseTemplates[scenarioId];
  if (!template) {
    throw new Error(`Unknown chart frame scenario: ${scenarioId}`);
  }
  return buildCandles(interpolateSeries(template, length));
}

export function buildScenarioHistoryFrames(
  scenario: Pick<EvalScenario, 'id' | 'label' | 'symbol' | 'timeframe' | 'structureHint'>,
  candlesPerFrame = 8,
): HistoricalChartFrame[] {
  if (scenario.id === 'btc-support-reclaim') {
    return btcHistoricalFrames;
  }

  return chunkIntoFrames(scenario as EvalScenario, buildScenarioCandles(scenario.id, candlesPerFrame * 6), candlesPerFrame);
}

export function getFieldHistoricalFrames(): HistoricalChartFrame[] {
  return btcHistoricalFrames;
}

export function getHistoricalChartFrame(frameId: string): HistoricalChartFrame | null {
  return btcHistoricalFrames.find((frame) => frame.id === frameId) ?? null;
}

export function getScenarioForHistoricalFrame(frameId: string): EvalScenario['id'] {
  return historicalFrameScenarioMap[frameId] ?? 'btc-support-reclaim';
}

export function getReferenceProofFrame(scenarioId: EvalScenario['id']): HistoricalChartFrame {
  const frameId = scenarioReferenceFrameMap[scenarioId];
  const frame = btcHistoricalFrames.find((entry) => entry.id === frameId);
  if (!frame) {
    throw new Error(`Missing reference proof frame for scenario: ${scenarioId}`);
  }
  return frame;
}

export function flattenHistoricalFrames(frames: HistoricalChartFrame[]): ChartCandle[] {
  return frames.flatMap((frame) => frame.candles);
}

export function getChartPriceRange(candles: ChartCandle[]) {
  return {
    min: Math.min(...candles.map((candle) => candle.low)),
    max: Math.max(...candles.map((candle) => candle.high)),
  };
}

export function getScenarioFrameTone(candles: ChartCandle[], start: number, end: number): FrameTone {
  const safeStart = clamp(start, 0, candles.length - 1);
  const safeEnd = clamp(end, safeStart, candles.length - 1);
  const startClose = candles[safeStart]?.close ?? 0;
  const endClose = candles[safeEnd]?.close ?? startClose;
  const delta = endClose - startClose;
  if (delta > 1.4) return 'bull';
  if (delta < -1.4) return 'bear';
  return 'flat';
}

export function resolveHistoricalFieldFrameIndex(worldX: number, fieldWidth: number): number {
  const frames = getFieldHistoricalFrames();
  const usableWidth = Math.max(1, fieldWidth - chartFieldPadding.left - chartFieldPadding.right);
  const normalizedX = clamp(worldX - chartFieldPadding.left, 0, usableWidth);
  const ratio = normalizedX / usableWidth;
  return clamp(Math.floor(ratio * frames.length), 0, frames.length - 1);
}

export function resolveHistoricalFieldFrame(worldX: number, fieldWidth: number): HistoricalChartFrame {
  const frames = getFieldHistoricalFrames();
  return frames[resolveHistoricalFieldFrameIndex(worldX, fieldWidth)] ?? frames[0];
}
