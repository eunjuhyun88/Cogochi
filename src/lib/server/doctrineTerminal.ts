import { getHistoricalChartFrame } from '$lib/engine/chart-frame-model';
import type {
  DoctrineEvidenceFrame,
  DoctrinePatternId,
  DoctrineTerminalResult,
  OverlaySpec,
  PineDraft,
  TrainingLoadout,
} from '$lib/types';

const doctrineQuickPrompts = [
  'BTC에서 OI 과열 + CVD 다이버전스 구간 찾아줘',
  '분배 구간을 구조 기준으로 마킹해줘',
  '펀딩 과열을 더 보수적으로 찾게 만들어줘',
  '브레이크아웃 직전 함정 구간만 보고 싶어',
] as const;

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type PatternPreset = {
  id: DoctrinePatternId;
  title: string;
  normalizedIntent: string;
  recommendedProofPackId: string | null;
  criteriaSummary: string[];
  explanation: string[];
  overlaySpec: Omit<OverlaySpec, 'id'>;
  pineDraft: Omit<PineDraft, 'id'>;
  evidenceFrameIds: string[];
  suggestedLoadout: Partial<TrainingLoadout>;
};

const patternPresets: PatternPreset[] = [
  {
    id: 'OI_SPIKE',
    title: 'OI Spike Detector',
    normalizedIntent: 'Detect open-interest expansion with crowding pressure and flag fragile momentum zones.',
    recommendedProofPackId: 'public-passport-gauntlet',
    criteriaSummary: [
      'OI 24h expansion above crowd threshold',
      'Three-candle persistence to avoid one-bar noise',
      'Volume confirmation to avoid hollow spikes',
    ],
    explanation: [
      'OI expansion without persistence is usually noise, so the detector waits for repeated pressure.',
      'Volume confirmation prevents the system from blessing dead liquidity spikes.',
      'The result should bias the agent toward trap awareness, not blind continuation.',
    ],
    overlaySpec: {
      title: 'OI Spike Overlay',
      summary: 'Marks crowding surges and keeps the squad alert for liquidation-driven reversals.',
      layers: [
        { id: 'oi-badge', kind: 'BADGE', label: 'OI +15%', tone: 'WARN', rule: '24h OI expansion above threshold', detail: 'Warns that fresh positioning is stacking too fast.' },
        { id: 'volume-band', kind: 'BAND', label: 'Volume confirm', tone: 'INFO', rule: 'Volume z-score above confirmation line', detail: 'Requires flow confirmation before promoting the setup.' },
        { id: 'trap-zone', kind: 'ZONE', label: 'Trap watch', tone: 'BEAR', rule: 'Crowding plus weak follow-through', detail: 'Turns the region into a likely liquidation trap watch.' },
      ],
    },
    pineDraft: {
      title: 'OI Spike Detector [Cogochi]',
      code: `//@version=5
indicator("OI Spike Detector [Cogochi]", overlay=true)
oi_threshold = input.float(0.15, "OI Threshold", step=0.01)
consec_bars = input.int(3, "Consecutive Bars")
oi_proxy = ta.change(volume) / volume[1]
oi_spike = oi_proxy > oi_threshold
consec_spike = ta.barssince(not oi_spike) >= consec_bars - 1
vol_zscore = (volume - ta.sma(volume, 20)) / ta.stdev(volume, 20)
signal = consec_spike and vol_zscore > 2.0
bgcolor(signal ? color.new(color.orange, 80) : na)
plotshape(signal, style=shape.triangleup, location=location.belowbar, color=color.orange, size=size.small)`,
      notes: [
        'Export draft only. In-app rendering should follow OverlaySpec, not Pine execution.',
        'Uses a volume proxy because TradingView Pine access to true OI depends on external feeds.',
      ],
    },
    evidenceFrameIds: ['ftx-collapse-flush', 'spot-etf-approval-whipsaw'],
    suggestedLoadout: {
      indicatorPresetId: 'LIQUIDITY_LENS',
      scriptPresetId: 'TRAP_FADE',
      memoryBias: 'FAILURES',
      confidenceStyle: 'BALANCED',
      doctrineNote: 'Respect crowding spikes only after the third bar confirms and volume agrees.',
    },
  },
  {
    id: 'CVD_DIVERGENCE',
    title: 'CVD Divergence Lens',
    normalizedIntent: 'Find price continuation that is no longer backed by aggressive flow.',
    recommendedProofPackId: 'public-passport-gauntlet',
    criteriaSummary: [
      'Price pushes toward local highs while CVD fails to confirm',
      'Higher-timeframe structure still matters more than one isolated wick',
      'The setup should reward reversal patience, not immediate hero calls',
    ],
    explanation: [
      'Divergence is useful only when price still looks strong enough to tempt late entries.',
      'Structure context matters because weak divergence inside clean trend continuation is often too early.',
      'The detector should support reversal bias while still demanding confirmation.',
    ],
    overlaySpec: {
      title: 'CVD Divergence Overlay',
      summary: 'Highlights places where aggressive flow weakens before price accepts the same story.',
      layers: [
        { id: 'cvd-badge', kind: 'BADGE', label: 'CVD weak', tone: 'INFO', rule: 'Flow delta fails to confirm price push', detail: 'Marks weakening aggression under the surface.' },
        { id: 'rejection-zone', kind: 'ZONE', label: 'Reversal watch', tone: 'BEAR', rule: 'Price high plus weak flow confirmation', detail: 'Signals a reversal watch, not instant execution.' },
        { id: 'structure-marker', kind: 'MARKER', label: 'Wait for break', tone: 'WARN', rule: 'Structure must crack before commit', detail: 'Forces confirmation before the squad blesses the call.' },
      ],
    },
    pineDraft: {
      title: 'CVD Divergence [Cogochi]',
      code: `//@version=5
indicator("CVD Divergence [Cogochi]", overlay=true)
length = input.int(14, "Lookback")
delta = close > open ? volume : close < open ? -volume : 0
cvd = ta.cum(delta)
cvd_norm = (cvd - ta.lowest(cvd, length)) / (ta.highest(cvd, length) - ta.lowest(cvd, length) + 1e-10)
price_norm = (close - ta.lowest(close, length)) / (ta.highest(close, length) - ta.lowest(close, length) + 1e-10)
diverge = price_norm > 0.7 and cvd_norm < 0.3
bgcolor(diverge ? color.new(color.blue, 75) : na)
plotshape(diverge, style=shape.circle, location=location.abovebar, color=color.blue, size=size.tiny)`,
      notes: [
        'Export draft only. Treat this as a sketch of the logic, not the authoritative proof implementation.',
      ],
    },
    evidenceFrameIds: ['china-crackdown-flush', 'ath-sweep-reversal'],
    suggestedLoadout: {
      indicatorPresetId: 'STRUCTURE_MAP',
      scriptPresetId: 'SUPPORT_DEFEND',
      memoryBias: 'PLAYBOOKS',
      confidenceStyle: 'CONSERVATIVE',
      doctrineNote: 'Call reversal only after structure confirms that weak flow turned into rejection.',
    },
  },
  {
    id: 'FUNDING_HEAT',
    title: 'Funding Overheated Detector',
    normalizedIntent: 'Flag overpaid directional bias before the crowd gets punished.',
    recommendedProofPackId: 'whipsaw-control-pack',
    criteriaSummary: [
      'Funding above heat threshold',
      'Positioning still leans the same way',
      'The output should warn the squad before continuation gets too expensive',
    ],
    explanation: [
      'Funding heat should change risk posture before it becomes a hard entry trigger.',
      'The player usually wants a caution marker here, not a guaranteed short signal.',
      'The design is stronger when it teaches discipline around crowd pain.',
    ],
    overlaySpec: {
      title: 'Funding Heat Overlay',
      summary: 'Paints overheated funding stretches so the squad stops chasing crowded continuation.',
      layers: [
        { id: 'fund-badge', kind: 'BADGE', label: 'Funding hot', tone: 'WARN', rule: 'Funding exceeds crowd threshold', detail: 'Shows when holding the same direction becomes too expensive.' },
        { id: 'crowd-band', kind: 'BAND', label: 'Crowding band', tone: 'BEAR', rule: 'Crowded direction stays active while funding rises', detail: 'Marks the region as fragile continuation.' },
      ],
    },
    pineDraft: {
      title: 'Funding Overheated [Cogochi]',
      code: `//@version=5
indicator("Funding Overheated [Cogochi]", overlay=true)
threshold = input.float(0.0008, "Funding Threshold", step=0.0001)
oi_mom = ta.roc(volume, 8)
proxy_fund = oi_mom / 100
hot = proxy_fund > threshold
bgcolor(hot ? color.new(color.red, 82) : na)
plotshape(hot, style=shape.flag, location=location.abovebar, color=color.red, size=size.tiny)`,
      notes: [
        'Uses a proxy when a direct funding series is unavailable in Pine.',
      ],
    },
    evidenceFrameIds: ['spot-etf-approval-whipsaw', 'etf-headline-whipsaw'],
    suggestedLoadout: {
      indicatorPresetId: 'LIQUIDITY_LENS',
      scriptPresetId: 'BREAKOUT_CONFIRM',
      memoryBias: 'FAILURES',
      confidenceStyle: 'CONSERVATIVE',
      doctrineNote: 'When funding overheats, reduce aggression until the crowd pays for extension.',
    },
  },
  {
    id: 'DISTRIBUTION_ZONE',
    title: 'Distribution Zone Marker',
    normalizedIntent: 'Mark high-price stall zones where continuation looks strong but sponsorship fades.',
    recommendedProofPackId: 'public-passport-gauntlet',
    criteriaSummary: [
      'Price stalls near recent highs',
      'Volume weakens relative to the local average',
      'The setup should read as distribution pressure, not instant collapse certainty',
    ],
    explanation: [
      'Distribution is a structure story, so the marker should stay tied to local highs and weaker sponsorship.',
      'This should improve patience for short bias without faking certainty.',
      'The detector is best when it supports later proof and replay, not one lucky candle call.',
    ],
    overlaySpec: {
      title: 'Distribution Overlay',
      summary: 'Marks shelves where sponsorship fades and the squad should question upside continuation.',
      layers: [
        { id: 'dist-zone', kind: 'ZONE', label: 'Distribution', tone: 'BEAR', rule: 'Price near highs while volume fades', detail: 'Marks a shelf where strong sponsorship is missing.' },
        { id: 'rsi-badge', kind: 'BADGE', label: 'RSI elevated', tone: 'WARN', rule: 'Momentum remains stretched during stall', detail: 'Adds context for why late continuation may be fragile.' },
      ],
    },
    pineDraft: {
      title: 'Distribution Zone [Cogochi]',
      code: `//@version=5
indicator("Distribution Zone [Cogochi]", overlay=true)
length = input.int(20, "Length")
near_high = close >= ta.highest(close, length) * 0.98
vol_dec = volume < ta.sma(volume, length) * 0.8
rsi = ta.rsi(close, 14)
dist_zone = near_high and vol_dec and rsi > 60
bgcolor(dist_zone ? color.new(color.red, 85) : na)
plotshape(dist_zone, style=shape.square, location=location.abovebar, color=color.red, size=size.tiny)`,
      notes: [
        'Use as a visual structure sketch. Proof remains the source of truth for whether the logic survives.',
      ],
    },
    evidenceFrameIds: ['etf-headline-whipsaw', 'ftx-collapse-flush'],
    suggestedLoadout: {
      indicatorPresetId: 'STRUCTURE_MAP',
      scriptPresetId: 'TRAP_FADE',
      memoryBias: 'PLAYBOOKS',
      confidenceStyle: 'BALANCED',
      doctrineNote: 'Treat fading sponsorship near local highs as distribution pressure until structure proves otherwise.',
    },
  },
];

function buildEvidenceFrames(frameIds: string[]): DoctrineEvidenceFrame[] {
  return frameIds
    .map((frameId) => getHistoricalChartFrame(frameId))
    .filter((frame): frame is NonNullable<typeof frame> => Boolean(frame))
    .map<DoctrineEvidenceFrame>((frame) => ({
      id: frame.id,
      title: frame.title,
      dateLabel: frame.dateLabel,
      note: frame.note,
    }));
}

function fallbackPreset(prompt: string): PatternPreset {
  return {
    id: 'CUSTOM',
    title: 'Custom Doctrine Draft',
    normalizedIntent: 'Convert the player prompt into a reviewable doctrine candidate before proof.',
    recommendedProofPackId: null,
    criteriaSummary: [
      `Prompt: ${prompt}`,
      'Translate the request into readable criteria before promotion.',
      'Bind the result to proof before any mutation survives.',
    ],
    explanation: [
      'The terminal should help the player compress intent into one proofable doctrine statement.',
      'Unknown prompts become custom doctrine drafts rather than fake certainty.',
      'The next step is proof, not blind promotion.',
    ],
    overlaySpec: {
      title: 'Custom Doctrine Overlay',
      summary: 'A neutral preview that keeps the player focused on criteria clarity before proof.',
      layers: [
        { id: 'custom-badge', kind: 'BADGE', label: 'Custom doctrine', tone: 'NEUTRAL', rule: 'Prompt needs proof-ready thresholds', detail: 'Used when the prompt does not cleanly map to one preset.' },
      ],
    },
    pineDraft: {
      title: 'Custom Doctrine Draft [Cogochi]',
      code: `//@version=5
indicator("Custom Doctrine Draft [Cogochi]", overlay=true)
// Replace the placeholders below with proof-ready thresholds.
condition = false
bgcolor(condition ? color.new(color.gray, 85) : na)`,
      notes: ['This draft is intentionally incomplete until the player sharpens the criteria.'],
    },
    evidenceFrameIds: ['bank-crisis-rebound'],
    suggestedLoadout: {
      doctrineNote: prompt,
      confidenceStyle: 'BALANCED',
    },
  };
}

function choosePatternPreset(prompt: string): PatternPreset {
  const normalized = prompt.toLowerCase();
  if (normalized.includes('oi') && (normalized.includes('과열') || normalized.includes('spike') || normalized.includes('급증'))) {
    return patternPresets[0];
  }
  if (normalized.includes('cvd') && (normalized.includes('div') || normalized.includes('다이버') || normalized.includes('발산') || normalized.includes('이탈'))) {
    return patternPresets[1];
  }
  if (normalized.includes('fund') || normalized.includes('펀딩')) {
    return patternPresets[2];
  }
  if (normalized.includes('distribution') || normalized.includes('분배')) {
    return patternPresets[3];
  }
  return fallbackPreset(prompt);
}

export function getDoctrineQuickPrompts(): string[] {
  return [...doctrineQuickPrompts];
}

export function generateDoctrineTerminalResult(prompt: string): DoctrineTerminalResult {
  const trimmedPrompt = prompt.trim();
  const preset = choosePatternPreset(trimmedPrompt);

  return {
    id: makeId('doctrine'),
    title: preset.title,
    patternId: preset.id,
    userPrompt: trimmedPrompt,
    normalizedIntent: preset.normalizedIntent,
    recommendedProofPackId: preset.recommendedProofPackId,
    criteriaSummary: [...preset.criteriaSummary],
    explanation: [...preset.explanation],
    overlaySpec: {
      id: makeId('overlay'),
      title: preset.overlaySpec.title,
      summary: preset.overlaySpec.summary,
      layers: preset.overlaySpec.layers.map((layer) => ({ ...layer })),
    },
    pineDraft: preset.pineDraft
      ? {
          id: makeId('pine'),
          title: preset.pineDraft.title,
          code: preset.pineDraft.code,
          notes: [...preset.pineDraft.notes],
        }
      : null,
    evidenceFrames: buildEvidenceFrames(preset.evidenceFrameIds),
    suggestedLoadout: {
      ...preset.suggestedLoadout,
    },
  };
}
