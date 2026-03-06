export interface TrainingProfile {
  archetype: string;
  behavior: string;
  retrainingPath: string;
  focusSkill: string;
  indicators: string[];
  readout: string;
}

const DEFAULT_PROFILE: TrainingProfile = {
  archetype: 'Generalist Scout',
  behavior: 'Balanced reads with controlled risk.',
  retrainingPath: 'Signal Stabilizer',
  focusSkill: 'Confidence Pulse',
  indicators: ['Trend Scan', 'Crowd Echo'],
  readout: 'Stable readout with moderate conviction.'
};

export const TRAINING_PROFILES: Record<string, TrainingProfile> = {
  trendlet: {
    archetype: 'Breakout Chaser',
    behavior: 'Prioritizes early directional conviction and fast follow-through.',
    retrainingPath: 'Trend Hunter',
    focusSkill: 'Orb Amplify',
    indicators: ['Trend Scan', 'Breakout Ping', 'Open Interest Lift'],
    readout: 'Aggressive opener tuned for trend ignition.'
  },
  reverto: {
    archetype: 'Range Tactician',
    behavior: 'Waits for overstretch signals and punishes reversion windows.',
    retrainingPath: 'Contrarian Loop',
    focusSkill: 'Confidence Stabilize',
    indicators: ['Range Detect', 'Pullback Signal', 'Overheat Alert'],
    readout: 'High composure in sideways regimes.'
  },
  flowling: {
    archetype: 'Liquidity Scout',
    behavior: 'Tracks whale movement and accelerates when flow aligns.',
    retrainingPath: 'Liquidity Oracle',
    focusSkill: 'Target Override',
    indicators: ['Whale Ping', 'Exchange Watch', 'CVD Sweep'],
    readout: 'Excellent at spotting heavy capital rotation.'
  },
  deribit: {
    archetype: 'Volatility Striker',
    behavior: 'Commits hard when liquidation or funding dislocations appear.',
    retrainingPath: 'Volatility Sniper',
    focusSkill: 'Clash Burst',
    indicators: ['Funding Watch', 'OI Pulse', 'Liq Radar'],
    readout: 'High-risk response tuned for violent moves.'
  },
  sentra: {
    archetype: 'Mood Reader',
    behavior: 'Reads crowd shifts and flips positioning when sentiment breaks.',
    retrainingPath: 'Crowd Whisper',
    focusSkill: 'Morale Shield',
    indicators: ['Mood Scan', 'Crowd Echo', 'Fear Greed Divergence'],
    readout: 'Best when narrative and price diverge.'
  },
  macrobit: {
    archetype: 'Cycle Commander',
    behavior: 'Trades slower but anchors the squad around regime transitions.',
    retrainingPath: 'Macro Compass',
    focusSkill: 'Regime Lock',
    indicators: ['Macro Pulse', 'Cycle Beacon', 'Funding Drift'],
    readout: 'Heavy anchor built for macro rotation calls.'
  }
};

export function getTrainingProfile(dexId: string): TrainingProfile {
  return TRAINING_PROFILES[dexId] ?? DEFAULT_PROFILE;
}
