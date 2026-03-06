import type { EvalScenario, EvalScenarioTemplate } from '../types';

export const EVAL_SCENARIO_TEMPLATES: EvalScenarioTemplate[] = [
  {
    id: 'btc-breakout-pulse',
    label: 'BTC Breakout Pulse',
    brief: '추세 돌파형 벤치마크입니다. 빠른 신호 포착과 추세 지속 판정이 중요합니다.',
    mode: 'PVE_BENCHMARK',
    symbol: 'BTCUSDT',
    timeframe: '15m',
    marketWindowId: 'btc-breakout-window',
    objective: 'Capture directional continuation early without overtrading the breakout.',
    allowedDataSourceKinds: ['PRICE', 'NEWS', 'USER_NOTE'],
    scoringWeights: {
      returnWeight: 0.32,
      riskWeight: 0.16,
      accuracyWeight: 0.2,
      calibrationWeight: 0.1,
      reasoningWeight: 0.12,
      coordinationWeight: 0.1
    },
    targetRegime: 'TREND',
    startingPrice: 102_400,
    baselinePriceChange5m: 0.58,
    baselineVolatility: 0.26,
    baselineFearGreed: 61,
    baselineFundingRate: 0.0007,
    baselineOpenInterestChange: 1.4
  },
  {
    id: 'eth-range-fade',
    label: 'ETH Range Fade',
    brief: '박스권 역추세형 벤치마크입니다. 과신 억제와 평균회귀 판단이 중요합니다.',
    mode: 'PVE_BENCHMARK',
    symbol: 'ETHUSDT',
    timeframe: '5m',
    marketWindowId: 'eth-range-window',
    objective: 'Fade overextended moves while avoiding false breakouts inside the range.',
    allowedDataSourceKinds: ['PRICE', 'SOCIAL', 'USER_NOTE'],
    scoringWeights: {
      returnWeight: 0.24,
      riskWeight: 0.24,
      accuracyWeight: 0.16,
      calibrationWeight: 0.14,
      reasoningWeight: 0.12,
      coordinationWeight: 0.1
    },
    targetRegime: 'RANGE',
    startingPrice: 4_860,
    baselinePriceChange5m: -0.12,
    baselineVolatility: 0.41,
    baselineFearGreed: 48,
    baselineFundingRate: -0.0001,
    baselineOpenInterestChange: -0.4
  },
  {
    id: 'btc-macro-defense',
    label: 'BTC Macro Defense',
    brief: '매크로 이벤트 방어형 벤치마크입니다. 리스크 제어와 근거 설명 품질을 더 강하게 봅니다.',
    mode: 'PVE_BENCHMARK',
    symbol: 'BTCUSDT',
    timeframe: '1h',
    marketWindowId: 'btc-macro-defense-window',
    objective: 'Preserve capital through macro volatility while keeping calibrated conviction.',
    allowedDataSourceKinds: ['PRICE', 'NEWS', 'MACRO', 'USER_NOTE'],
    scoringWeights: {
      returnWeight: 0.2,
      riskWeight: 0.28,
      accuracyWeight: 0.14,
      calibrationWeight: 0.14,
      reasoningWeight: 0.14,
      coordinationWeight: 0.1
    },
    targetRegime: 'RANGE',
    startingPrice: 99_300,
    baselinePriceChange5m: 0.08,
    baselineVolatility: 0.48,
    baselineFearGreed: 39,
    baselineFundingRate: -0.0003,
    baselineOpenInterestChange: 0.5
  },
  {
    id: 'sol-onchain-chase',
    label: 'SOL Onchain Chase',
    brief: '온체인/소셜 과열 추적형 벤치마크입니다. 과열 신호와 후행 추격 리스크를 같이 봅니다.',
    mode: 'PVE_BENCHMARK',
    symbol: 'SOLUSDT',
    timeframe: '15m',
    marketWindowId: 'sol-onchain-window',
    objective: 'Use onchain and social momentum without chasing exhausted expansion.',
    allowedDataSourceKinds: ['PRICE', 'ONCHAIN', 'SOCIAL', 'USER_NOTE'],
    scoringWeights: {
      returnWeight: 0.3,
      riskWeight: 0.18,
      accuracyWeight: 0.18,
      calibrationWeight: 0.1,
      reasoningWeight: 0.12,
      coordinationWeight: 0.12
    },
    targetRegime: 'TREND',
    startingPrice: 236,
    baselinePriceChange5m: 0.74,
    baselineVolatility: 0.34,
    baselineFearGreed: 68,
    baselineFundingRate: 0.0011,
    baselineOpenInterestChange: 1.8
  }
];

export const DEFAULT_EVAL_SCENARIO_ID = EVAL_SCENARIO_TEMPLATES[0].id;

export function createEvalScenario(templateId = DEFAULT_EVAL_SCENARIO_ID, scenarioStartAt = Date.now()): EvalScenario {
  const template =
    EVAL_SCENARIO_TEMPLATES.find((entry) => entry.id === templateId) ??
    EVAL_SCENARIO_TEMPLATES[0];

  return {
    ...template,
    scenarioStartAt
  };
}

export function getEvalScenarioTemplate(templateId = DEFAULT_EVAL_SCENARIO_ID): EvalScenarioTemplate {
  return EVAL_SCENARIO_TEMPLATES.find((entry) => entry.id === templateId) ?? EVAL_SCENARIO_TEMPLATES[0];
}
