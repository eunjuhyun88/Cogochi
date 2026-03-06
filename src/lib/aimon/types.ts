export type AiMonType =
  | 'Momentum'
  | 'MeanReversion'
  | 'Flow'
  | 'Derivatives'
  | 'Sentiment'
  | 'Macro';

export type MarketRegime = 'TREND' | 'RANGE';
export type AgentState = 'IDLE' | 'SCAN' | 'LOCK' | 'CAST' | 'CLASH' | 'EXECUTE' | 'COOLDOWN';
export type BattlePhase = 'OPEN' | 'EVIDENCE' | 'DECISION' | 'MARKET' | 'RESULT';
export type OrbKind = 'LONG' | 'SHORT' | 'RISK' | 'NEUTRAL';
export type TeamSide = 'player' | 'enemy';
export type BattleOutcome = 'WIN' | 'LOSS' | 'DRAW';

export interface AiMonStats {
  detection: number;
  prediction: number;
  risk: number;
  speed: number;
}

export interface AiMonDexEntry {
  id: string;
  dexNo: string;
  name: string;
  type: AiMonType;
  color: string;
  accent: string;
  counterType: AiMonType;
  evolvesTo?: string;
  evolvesAtXp?: number;
  description: string;
  signatureMoves: string[];
  baseStats: AiMonStats;
}

export interface MarketState {
  tick: number;
  timestamp: number;
  price: number;
  priceChange5m: number;
  volatility: number;
  fearGreed: number;
  fundingRate: number;
  openInterestChange: number;
  regime: MarketRegime;
  regimeStrength: number;
}

export interface AiMonInstance {
  instanceId: string;
  dexId: string;
  slot: number;
  team: TeamSide;
  name: string;
  type: AiMonType;
  level: number;
  xp: number;
  state: AgentState;
  stateEnteredAt: number;
  focusTapUntil: number;
  currentTarget?: string;
  lastOrbAt: number;
  position: {
    x: number;
    y: number;
  };
  recentAccuracy: number;
  stats: AiMonStats;
}

export interface SignalOrb {
  id: string;
  ownerId: string;
  team: TeamSide;
  type: AiMonType;
  kind: OrbKind;
  strength: number;
  confidence: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bornAt: number;
  absorbed: boolean;
}

export interface SignalInteractionEvent {
  id: string;
  kind: 'AMPLIFY' | 'COUNTER' | 'CLASH';
  label: string;
  ownerIds: string[];
  orbIds: string[];
  at: number;
}

export interface BattleResult {
  outcome: BattleOutcome;
  consensus: number;
  openingPrice: number;
  closingPrice: number;
  priceDeltaPct: number;
  xpGain: number;
  researchGain: number;
  note: string;
}

export interface BattleState {
  phase: BattlePhase;
  phaseStartedAt: number;
  phaseRemainingMs: number;
  market: MarketState;
  openingPrice: number;
  playerTeam: AiMonInstance[];
  enemyTeam: AiMonInstance[];
  orbs: SignalOrb[];
  consensus: number;
  focusTapCharges: number;
  round: number;
  running: boolean;
  eventBanner: string;
  interactions: SignalInteractionEvent[];
  result: BattleResult | null;
  rewardsApplied: boolean;
}

export interface PlayerProgress {
  xp: number;
  researchPoints: number;
  battleCount: number;
  wins: number;
  unlockedDexIds: string[];
  teamDexIds: string[];
}

export interface TeamSynergySummary {
  score: number;
  notes: string[];
}

export const PHASE_DURATIONS_MS: Record<BattlePhase, number> = {
  OPEN: 5_000,
  EVIDENCE: 35_000,
  DECISION: 10_000,
  MARKET: 20_000,
  RESULT: 10_000
};

