import type { AiMonDexEntry } from '../types';

export const AIMON_DEX: AiMonDexEntry[] = [
  {
    id: 'trendlet',
    dexNo: '#001',
    name: 'Trendlet',
    type: 'Momentum',
    color: '#ff6b35',
    accent: '#c84614',
    counterType: 'MeanReversion',
    evolvesTo: 'trendion',
    evolvesAtXp: 120,
    description: 'Breakout 감지에 특화된 로켓형 AI Mon.',
    signatureMoves: ['Trend Scan', 'Breakout Ping'],
    baseStats: { detection: 76, prediction: 81, risk: 52, speed: 74 }
  },
  {
    id: 'reverto',
    dexNo: '#003',
    name: 'Reverto',
    type: 'MeanReversion',
    color: '#00e5ff',
    accent: '#00a0b4',
    counterType: 'Momentum',
    evolvesTo: 'reverto-prime',
    evolvesAtXp: 110,
    description: '과열/과매도를 감지해 되돌림 구간을 노리는 균형형.',
    signatureMoves: ['Range Detect', 'Pullback Signal'],
    baseStats: { detection: 72, prediction: 78, risk: 65, speed: 58 }
  },
  {
    id: 'flowling',
    dexNo: '#005',
    name: 'Flowling',
    type: 'Flow',
    color: '#00ff88',
    accent: '#00b460',
    counterType: 'Sentiment',
    evolvesTo: 'flowra',
    evolvesAtXp: 140,
    description: '고래와 유동성 흐름을 읽는 수평형 스카우터.',
    signatureMoves: ['Whale Ping', 'Exchange Watch'],
    baseStats: { detection: 82, prediction: 74, risk: 61, speed: 63 }
  },
  {
    id: 'deribit',
    dexNo: '#007',
    name: 'Deribit',
    type: 'Derivatives',
    color: '#7b2fff',
    accent: '#5014c0',
    counterType: 'Macro',
    evolvesTo: 'derivion',
    evolvesAtXp: 135,
    description: '청산, OI, 펀딩 변화를 공격적으로 추적하는 번개형.',
    signatureMoves: ['Funding Watch', 'OI Pulse'],
    baseStats: { detection: 68, prediction: 80, risk: 72, speed: 71 }
  },
  {
    id: 'sentra',
    dexNo: '#009',
    name: 'Sentra',
    type: 'Sentiment',
    color: '#ffd700',
    accent: '#c8a000',
    counterType: 'Flow',
    evolvesTo: 'sentra-oracle',
    evolvesAtXp: 100,
    description: '심리 전환과 crowd bias를 읽는 관찰형 AI Mon.',
    signatureMoves: ['Mood Scan', 'Crowd Echo'],
    baseStats: { detection: 75, prediction: 69, risk: 57, speed: 67 }
  },
  {
    id: 'macrobit',
    dexNo: '#011',
    name: 'Macrobit',
    type: 'Macro',
    color: '#ff3355',
    accent: '#b41432',
    counterType: 'Derivatives',
    evolvesTo: 'macro-prime',
    evolvesAtXp: 150,
    description: '거시 방향성과 레짐 변화를 읽는 느리지만 단단한 리더형.',
    signatureMoves: ['Macro Pulse', 'Cycle Beacon'],
    baseStats: { detection: 62, prediction: 83, risk: 78, speed: 49 }
  }
];

export const aimonDexById = AIMON_DEX.reduce<Record<string, AiMonDexEntry>>((acc, entry) => {
  acc[entry.id] = entry;
  return acc;
}, {});

export const DEFAULT_TEAM_DEX_IDS = ['trendlet', 'reverto', 'flowling', 'sentra'];

