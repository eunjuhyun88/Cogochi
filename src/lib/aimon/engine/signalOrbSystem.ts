import { getCounterType, getRegimeMultiplier } from '../data/typeChart';
import type { AiMonInstance, MarketState, OrbKind, SignalInteractionEvent, SignalOrb } from '../types';

function distance(a: SignalOrb, b: SignalOrb): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pickOrbKind(agent: AiMonInstance, market: MarketState): OrbKind {
  if (agent.team === 'player') {
    if (agent.plannedAction === 'LONG') return 'LONG';
    if (agent.plannedAction === 'SHORT') return 'SHORT';
    if (agent.plannedAction === 'FLAT') return agent.role === 'RISK' ? 'RISK' : 'NEUTRAL';
  }

  if (agent.type === 'Momentum') return market.regime === 'TREND' ? 'LONG' : 'RISK';
  if (agent.type === 'MeanReversion') return market.regime === 'RANGE' ? 'LONG' : 'SHORT';
  if (agent.type === 'Flow') return market.priceChange5m >= 0 ? 'LONG' : 'SHORT';
  if (agent.type === 'Derivatives') return market.volatility > 0.35 ? 'RISK' : 'SHORT';
  if (agent.type === 'Sentiment') {
    return market.fearGreed >= 55 ? 'LONG' : market.fearGreed <= 45 ? 'SHORT' : 'NEUTRAL';
  }
  return market.priceChange5m >= 0 ? 'LONG' : 'SHORT';
}

export function createSignalOrb(agent: AiMonInstance, market: MarketState, now: number): SignalOrb {
  const focusBoost = agent.focusTapUntil > now ? 1.2 : 1;
  const strength = clamp(
    Math.round(agent.stats.prediction * getRegimeMultiplier(agent.type, market.regime) * focusBoost),
    30,
    100
  );
  const confidence = clamp(Math.round(agent.recentAccuracy * 100 * market.regimeStrength * focusBoost), 20, 99);

  return {
    id: `${agent.instanceId}-${now}`,
    ownerId: agent.instanceId,
    team: agent.team,
    type: agent.type,
    kind: pickOrbKind(agent, market),
    strength,
    confidence,
    x: agent.position.x,
    y: agent.position.y,
    vx: agent.team === 'player' ? 7 : -7,
    vy: (Math.random() - 0.5) * 1.4,
    bornAt: now,
    absorbed: false
  };
}

export function stepSignalOrbs(orbs: SignalOrb[]): SignalOrb[] {
  return orbs
    .map((orb) => ({
      ...orb,
      x: orb.x + orb.vx,
      y: orb.y + orb.vy
    }))
    .filter((orb) => !orb.absorbed && orb.x >= 0 && orb.x <= 100);
}

export function resolveSignalOrbInteractions(orbs: SignalOrb[], now: number): {
  orbs: SignalOrb[];
  interactions: SignalInteractionEvent[];
} {
  const next = orbs.map((orb) => ({ ...orb }));
  const interactions: SignalInteractionEvent[] = [];

  for (let i = 0; i < next.length; i++) {
    const a = next[i];
    if (!a || a.absorbed) continue;

    for (let j = i + 1; j < next.length; j++) {
      const b = next[j];
      if (!b || b.absorbed) continue;

      if (distance(a, b) > 10) continue;

      if (a.team === b.team && a.kind === b.kind) {
        a.strength = clamp(a.strength + 4, 0, 100);
        b.strength = clamp(b.strength + 4, 0, 100);
        interactions.push({
          id: `amp-${a.id}-${b.id}`,
          kind: 'AMPLIFY',
          label: `${a.type} + ${b.type} Amplify`,
          ownerIds: [a.ownerId, b.ownerId],
          orbIds: [a.id, b.id],
          at: now
        });
        continue;
      }

      if (a.team !== b.team) {
        const aCounters = getCounterType(a.type) === b.type;
        const bCounters = getCounterType(b.type) === a.type;
        const aWins = aCounters || (!bCounters && a.strength >= b.strength);
        const loser = aWins ? b : a;
        loser.absorbed = true;
        interactions.push({
          id: `cnt-${a.id}-${b.id}`,
          kind: aCounters || bCounters ? 'COUNTER' : 'CLASH',
          label: aCounters || bCounters ? 'Counter Clash' : 'Signal Clash',
          ownerIds: [a.ownerId, b.ownerId],
          orbIds: [a.id, b.id],
          at: now
        });
      }
    }
  }

  return {
    orbs: next.filter((orb) => !orb.absorbed),
    interactions
  };
}

export function computeConsensus(orbs: SignalOrb[]): number {
  const score = orbs.reduce((total, orb) => {
    const dir = orb.kind === 'LONG' ? 1 : orb.kind === 'SHORT' ? -1 : orb.kind === 'RISK' ? -0.4 : 0;
    const teamSign = orb.team === 'player' ? 1 : -1;
    return total + dir * orb.strength * teamSign;
  }, 0);

  return clamp(Math.round(50 + score / 10), 0, 100);
}
