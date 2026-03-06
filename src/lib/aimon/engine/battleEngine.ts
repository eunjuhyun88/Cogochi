import { AIMON_DEX } from '../data/aimonDex';
import { summarizeTeamSynergy } from '../data/synergies';
import { PHASE_DURATIONS_MS } from '../types';
import { advanceMarketState, createSimulatorState } from '../market/marketSimulator';
import { advanceAiMonState, transitionAiMonState } from './stateMachine';
import { computeConsensus, createSignalOrb, resolveSignalOrbInteractions, stepSignalOrbs } from './signalOrbSystem';
import type { AiMonDexEntry, AiMonInstance, BattlePhase, BattleResult, BattleState, PlayerProgress, TeamSide } from '../types';

const PLAYER_POSITIONS = [
  { x: 18, y: 22 },
  { x: 18, y: 42 },
  { x: 18, y: 62 },
  { x: 18, y: 82 }
];

const ENEMY_POSITIONS = [
  { x: 82, y: 22 },
  { x: 82, y: 42 },
  { x: 82, y: 62 },
  { x: 82, y: 82 }
];

const PHASE_ORDER: BattlePhase[] = ['OPEN', 'EVIDENCE', 'DECISION', 'MARKET', 'RESULT'];

function pickEntry(id: string): AiMonDexEntry {
  return AIMON_DEX.find((entry) => entry.id === id) ?? AIMON_DEX[0];
}

function shuffle<T>(values: T[]): T[] {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildInstance(entry: AiMonDexEntry, slot: number, team: TeamSide, now: number): AiMonInstance {
  const positions = team === 'player' ? PLAYER_POSITIONS : ENEMY_POSITIONS;
  const pos = positions[slot] ?? positions[positions.length - 1];
  return {
    instanceId: `${team}-${slot}-${entry.id}`,
    dexId: entry.id,
    slot,
    team,
    name: entry.name,
    type: entry.type,
    level: 1,
    xp: 0,
    state: 'IDLE',
    stateEnteredAt: now,
    focusTapUntil: 0,
    currentTarget: undefined,
    lastOrbAt: 0,
    position: pos,
    recentAccuracy: 0.62 + Math.random() * 0.18,
    stats: entry.baseStats
  };
}

function buildTeam(ids: string[], team: TeamSide, now: number): AiMonInstance[] {
  return ids.slice(0, 4).map((id, slot) => buildInstance(pickEntry(id), slot, team, now));
}

function nextPhase(phase: BattlePhase): BattlePhase {
  const idx = PHASE_ORDER.indexOf(phase);
  return PHASE_ORDER[Math.min(PHASE_ORDER.length - 1, idx + 1)] ?? 'RESULT';
}

function resolveBattleResult(state: BattleState): BattleResult {
  const closingPrice = state.market.price;
  const priceDeltaPct = ((closingPrice - state.openingPrice) / state.openingPrice) * 100;
  const bullishCall = state.consensus >= 55;
  const bearishCall = state.consensus <= 45;
  const wentUp = priceDeltaPct >= 0;
  const outcome =
    (bullishCall && wentUp) || (bearishCall && !wentUp)
      ? 'WIN'
      : !bullishCall && !bearishCall
        ? 'DRAW'
        : 'LOSS';

  return {
    outcome,
    consensus: state.consensus,
    openingPrice: state.openingPrice,
    closingPrice,
    priceDeltaPct,
    xpGain: outcome === 'WIN' ? 24 : outcome === 'DRAW' ? 16 : 10,
    researchGain: outcome === 'WIN' ? 12 : outcome === 'DRAW' ? 8 : 4,
    note:
      outcome === 'WIN'
        ? 'Consensus가 시장 방향과 일치했습니다.'
        : outcome === 'DRAW'
          ? 'Consensus가 중립에 가까워 무승부 처리되었습니다.'
          : 'Consensus 방향이 시장 움직임과 엇갈렸습니다.'
  };
}

function buildEnemyTeamIds(): string[] {
  return shuffle(AIMON_DEX.map((entry) => entry.id)).slice(0, 4);
}

export function createInitialBattleState(player: PlayerProgress): BattleState {
  const now = Date.now();
  const playerTeamIds =
    player.teamDexIds.length >= 4 ? player.teamDexIds.slice(0, 4) : AIMON_DEX.slice(0, 4).map((entry) => entry.id);
  const enemyTeamIds = buildEnemyTeamIds();
  const market = createSimulatorState();
  const synergy = summarizeTeamSynergy(playerTeamIds);

  return {
    phase: 'OPEN',
    phaseStartedAt: now,
    phaseRemainingMs: PHASE_DURATIONS_MS.OPEN,
    market,
    openingPrice: market.price,
    playerTeam: buildTeam(playerTeamIds, 'player', now),
    enemyTeam: buildTeam(enemyTeamIds, 'enemy', now),
    orbs: [],
    consensus: 50,
    focusTapCharges: 2,
    round: 1,
    running: true,
    eventBanner: `Prototype Ready · Team Synergy ${synergy.score}`,
    interactions: [],
    result: null,
    rewardsApplied: false
  };
}

export function applyFocusTap(state: BattleState, instanceId: string, now: number): BattleState {
  if (state.phase !== 'EVIDENCE' || state.focusTapCharges <= 0) return state;
  return {
    ...state,
    focusTapCharges: state.focusTapCharges - 1,
    eventBanner: 'Focus Tap applied · next orb strengthened',
    playerTeam: state.playerTeam.map((agent) =>
      agent.instanceId === instanceId ? { ...agent, focusTapUntil: now + 5000 } : agent
    )
  };
}

export function advanceBattleState(state: BattleState, now: number): BattleState {
  if (!state.running) return state;

  let market = state.market;
  if (state.phase === 'EVIDENCE' || state.phase === 'MARKET') {
    market = advanceMarketState(state.market);
  }

  const playerTeam = state.playerTeam.map((agent) => advanceAiMonState(agent, market, now));
  const enemyTeam = state.enemyTeam.map((agent) => advanceAiMonState(agent, market, now));
  let orbs = stepSignalOrbs(state.orbs);

  const spawnedPlayer = playerTeam.map((agent) => {
    if (agent.state === 'CAST' && agent.lastOrbAt < agent.stateEnteredAt) {
      orbs = [...orbs, createSignalOrb(agent, market, now)];
      return { ...agent, lastOrbAt: now };
    }
    return agent;
  });

  const spawnedEnemy = enemyTeam.map((agent) => {
    if (agent.state === 'CAST' && agent.lastOrbAt < agent.stateEnteredAt) {
      orbs = [...orbs, createSignalOrb(agent, market, now)];
      return { ...agent, lastOrbAt: now };
    }
    return agent;
  });

  const interactionsResult = resolveSignalOrbInteractions(orbs, now);
  orbs = interactionsResult.orbs;
  const interactionOwners = new Set(interactionsResult.interactions.flatMap((interaction) => interaction.ownerIds));

  const syncedPlayer = spawnedPlayer.map((agent) =>
    interactionOwners.has(agent.instanceId) ? transitionAiMonState(agent, 'CLASH', now) : agent
  );
  const syncedEnemy = spawnedEnemy.map((agent) =>
    interactionOwners.has(agent.instanceId) ? transitionAiMonState(agent, 'CLASH', now) : agent
  );

  const elapsed = now - state.phaseStartedAt;
  const phaseRemainingMs = Math.max(0, PHASE_DURATIONS_MS[state.phase] - elapsed);
  let phase = state.phase;
  let phaseStartedAt = state.phaseStartedAt;
  let result = state.result;
  let running: boolean = state.running;

  if (phaseRemainingMs === 0) {
    phase = nextPhase(state.phase);
    phaseStartedAt = now;
    if (phase === 'RESULT' && !result) {
      result = resolveBattleResult({
        ...state,
        market,
        consensus: computeConsensus(orbs)
      });
      running = true;
    }
  }

  if (state.phase === 'RESULT' && elapsed >= PHASE_DURATIONS_MS.RESULT) {
    running = false;
  }

  return {
    ...state,
    phase,
    phaseStartedAt,
    phaseRemainingMs: phase === state.phase ? phaseRemainingMs : PHASE_DURATIONS_MS[phase],
    market,
    playerTeam: syncedPlayer,
    enemyTeam: syncedEnemy,
    orbs,
    consensus: computeConsensus(orbs),
    running,
    eventBanner: interactionsResult.interactions[0]?.label ?? state.eventBanner,
    interactions: interactionsResult.interactions.slice(0, 6),
    result
  };
}

