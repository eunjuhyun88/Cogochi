import { getHistoricalChartFrame } from '$lib/engine/chart-frame-model';
import type {
  FieldCommandId,
  FieldEncounterOutcome,
  FieldEncounterState,
  FieldEncounterTurn,
  FieldRunStats,
} from '$lib/types';

export interface FieldCommandDefinition {
  id: FieldCommandId;
  label: string;
  shortLabel: string;
  hotkey: string;
  summary: string;
}

type EncounterSnapshot = {
  currentClose: number;
  nextClose: number;
  move: number;
  range: number;
  avgBody: number;
  avgRange: number;
  supportPrice: number;
  resistancePrice: number;
  hazardPrice: number | null;
  hazardLabel: string | null;
  hazardScore: number;
  recommendedCommandId: FieldCommandId;
  bark: string;
  clue: string;
};

type TurnResolution = {
  outcome: FieldEncounterOutcome;
  hpDelta: number;
  goldDelta: number;
  xpDelta: number;
  summary: string;
};

const INITIAL_VISIBLE_COUNT = 4;
const MAX_HP = 18;
const CAMP_HEAL = 6;
const CLEAR_GOLD_BONUS = 2;
const CLEAR_XP_BONUS = 2;

export const fieldCommandDefinitions: FieldCommandDefinition[] = [
  {
    id: 'LONG',
    label: 'LONG',
    shortLabel: 'Climb',
    hotkey: '1',
    summary: 'Commit to the rebound or continuation and push up the candle terrain.',
  },
  {
    id: 'SHORT',
    label: 'SHORT',
    shortLabel: 'Drop',
    hotkey: '2',
    summary: 'Press down through a rejection and force the breakdown before it recovers.',
  },
  {
    id: 'HOLD',
    label: 'HOLD',
    shortLabel: 'Wait',
    hotkey: '3',
    summary: 'Protect the squad and gather one more reveal before forcing the next call.',
  },
  {
    id: 'RUN',
    label: 'RUN',
    shortLabel: 'Retreat',
    hotkey: '4',
    summary: 'Close exposure, preserve HP, and survive the wick if the slice is too unstable.',
  },
];

export function createInitialFieldRunStats(): FieldRunStats {
  return {
    hp: 14,
    gold: 0,
    xp: 0,
    clearedFrameIds: [],
    failedFrameIds: [],
    resolvedTurns: 0,
    currentStreak: 0,
  };
}

export function restFieldRun(run: FieldRunStats): FieldRunStats {
  return {
    ...run,
    hp: clamp(run.hp + CAMP_HEAL, 0, MAX_HP),
  };
}

export function syncFieldEncounter(
  activeEncounter: FieldEncounterState | null,
  run: FieldRunStats,
  frameId: string | null,
): FieldEncounterState | null {
  if (!frameId) {
    return null;
  }
  if (activeEncounter?.frameId === frameId) {
    return activeEncounter;
  }
  return createFieldEncounter(frameId, run);
}

export function executeFieldCommand(
  encounter: FieldEncounterState,
  run: FieldRunStats,
  commandId: FieldCommandId,
): { encounter: FieldEncounterState; run: FieldRunStats; eventText: string } {
  if (encounter.cleared || encounter.failed) {
    return {
      encounter,
      run,
      eventText: encounter.cleared
        ? `${encounter.frameTitle} is already cleared. March to the next frame.`
        : `${encounter.frameTitle} already broke the squad. Pull back to camp before pushing again.`,
    };
  }

  const frame = requireFrame(encounter.frameId);
  const nextCandleIndex = encounter.visibleCount;
  const nextCandle = frame.candles[nextCandleIndex];
  if (!nextCandle) {
    return {
      encounter: {
        ...encounter,
        cleared: true,
      },
      run,
      eventText: `${encounter.frameTitle} is already fully revealed.`,
    };
  }

  const snapshot = buildSnapshot(encounter.frameId, encounter.visibleCount);
  const turn = encounter.turn;
  let updatedRun = { ...run };
  const resolution = resolveTurn(commandId, snapshot);
  const nextHp = clamp(updatedRun.hp + resolution.hpDelta, 0, MAX_HP);
  const nextGold = Math.max(0, updatedRun.gold + resolution.goldDelta);
  const nextXp = Math.max(0, updatedRun.xp + resolution.xpDelta);
  const nextVisibleCount = encounter.visibleCount + 1;
  const turnEntry: FieldEncounterTurn = {
    id: `${encounter.frameId}-${turn}`,
    turn,
    commandId,
    recommendedCommandId: snapshot.recommendedCommandId,
    revealedCandleIndex: nextCandleIndex,
    outcome: resolution.outcome,
    hpDelta: resolution.hpDelta,
    goldDelta: resolution.goldDelta,
    xpDelta: resolution.xpDelta,
    summary: resolution.summary,
  };

  updatedRun = {
    ...updatedRun,
    hp: nextHp,
    gold: nextGold,
    xp: nextXp,
    resolvedTurns: updatedRun.resolvedTurns + 1,
  };

  let nextEncounter: FieldEncounterState = {
    ...encounter,
    turn: turn + 1,
    visibleCount: nextVisibleCount,
    lastCommandId: commandId,
    lastOutcome: resolution.outcome,
    lastSummary: resolution.summary,
    turns: [turnEntry, ...encounter.turns].slice(0, 6),
  };

  if (nextHp <= 0) {
    updatedRun = {
      ...updatedRun,
      currentStreak: 0,
      failedFrameIds: uniqueFrameList(updatedRun.failedFrameIds, encounter.frameId),
      clearedFrameIds: updatedRun.clearedFrameIds.filter((frameIdItem) => frameIdItem !== encounter.frameId),
    };
    nextEncounter = {
      ...nextEncounter,
      failed: true,
      bark: 'The line snapped. Fall back to camp and rebuild the read.',
      clue: 'Route broken. Camp can restore HP, but the frame must be approached again cleanly.',
    };
    return {
      encounter: nextEncounter,
      run: updatedRun,
      eventText: `${encounter.frameTitle} hit too hard. Retreat to camp and reset the squad.`,
    };
  }

  if (nextVisibleCount >= frame.candles.length) {
    updatedRun = {
      ...updatedRun,
      gold: updatedRun.gold + CLEAR_GOLD_BONUS,
      xp: updatedRun.xp + CLEAR_XP_BONUS,
      currentStreak: updatedRun.currentStreak + 1,
      clearedFrameIds: uniqueFrameList(updatedRun.clearedFrameIds, encounter.frameId),
      failedFrameIds: updatedRun.failedFrameIds.filter((frameIdItem) => frameIdItem !== encounter.frameId),
    };
    nextEncounter = {
      ...nextEncounter,
      cleared: true,
      bark: 'Slice secured. Carry the clean read into the next frame.',
      clue: 'Frame cleared. The squad can now press deeper into BTC history.',
      lastSummary: `${resolution.summary} Frame cleared and the squad pockets the reward.`,
    };
    return {
      encounter: nextEncounter,
      run: updatedRun,
      eventText: `${encounter.frameTitle} cleared. The squad held the line and earned the reward.`,
    };
  }

  const nextSnapshot = buildSnapshot(encounter.frameId, nextVisibleCount);
  nextEncounter = {
    ...nextEncounter,
    recommendedCommandId: nextSnapshot.recommendedCommandId,
    supportPrice: nextSnapshot.supportPrice,
    resistancePrice: nextSnapshot.resistancePrice,
    hazardPrice: nextSnapshot.hazardPrice,
    hazardLabel: nextSnapshot.hazardLabel,
    bark: nextSnapshot.bark,
    clue: nextSnapshot.clue,
  };

  if (resolution.outcome === 'ADVANTAGE') {
    updatedRun = {
      ...updatedRun,
      currentStreak: updatedRun.currentStreak + 1,
    };
  } else if (resolution.outcome === 'PUNISHED') {
    updatedRun = {
      ...updatedRun,
      currentStreak: 0,
    };
  }

  return {
    encounter: nextEncounter,
    run: updatedRun,
    eventText: resolution.summary,
  };
}

function createFieldEncounter(frameId: string, run: FieldRunStats): FieldEncounterState {
  const frame = requireFrame(frameId);
  const visibleCount = Math.min(INITIAL_VISIBLE_COUNT, frame.candles.length - 1);
  const snapshot = buildSnapshot(frameId, visibleCount);
  const cleared = run.clearedFrameIds.includes(frameId);

  return {
    frameId,
    frameTitle: frame.title,
    frameDateLabel: frame.dateLabel,
    turn: 1,
    turnLimit: Math.max(1, frame.candles.length - visibleCount),
    visibleCount,
    recommendedCommandId: snapshot.recommendedCommandId,
    supportPrice: snapshot.supportPrice,
    resistancePrice: snapshot.resistancePrice,
    hazardPrice: snapshot.hazardPrice,
    hazardLabel: snapshot.hazardLabel,
    bark: cleared ? 'This frame already bows to the squad. Push forward.' : snapshot.bark,
    clue: cleared ? 'Already cleared. Rewards are spent here; the next frame is the real fight.' : snapshot.clue,
    lastCommandId: null,
    lastOutcome: null,
    lastSummary: cleared ? 'Frame already cleared on this run.' : null,
    cleared,
    failed: false,
    turns: [],
  };
}

function buildSnapshot(frameId: string, visibleCount: number): EncounterSnapshot {
  const frame = requireFrame(frameId);
  const safeVisibleCount = clamp(visibleCount, 2, frame.candles.length - 1);
  const visibleCandles = frame.candles.slice(0, safeVisibleCount);
  const currentCandle = visibleCandles.at(-1) ?? frame.candles[0];
  const nextCandle = frame.candles[safeVisibleCount] ?? currentCandle;
  const avgBody = average(
    visibleCandles.map((candle) => Math.abs(candle.close - candle.open)).filter((value) => Number.isFinite(value)),
  );
  const avgRange = average(visibleCandles.map((candle) => candle.high - candle.low).filter((value) => Number.isFinite(value)));
  const avgVolume = average(visibleCandles.map((candle) => candle.volume).filter((value) => Number.isFinite(value)));
  const move = nextCandle.close - currentCandle.close;
  const range = nextCandle.high - nextCandle.low;
  const upperWick = nextCandle.high - Math.max(nextCandle.open, nextCandle.close);
  const lowerWick = Math.min(nextCandle.open, nextCandle.close) - nextCandle.low;
  const wickPressure = Math.max(upperWick, lowerWick) / Math.max(1, range);
  const volumeSpike = nextCandle.volume / Math.max(1, avgVolume);
  const hazardScore = clamp(
    (range / Math.max(1, avgRange * 1.35)) * 0.42 +
      wickPressure * 0.34 +
      Math.max(0, volumeSpike - 1) * 0.24,
    0,
    1,
  );
  const supportPrice = Math.min(...visibleCandles.map((candle) => candle.low));
  const resistancePrice = Math.max(...visibleCandles.map((candle) => candle.high));
  const moveMagnitude = Math.abs(move);
  const compressed = moveMagnitude <= avgBody * 0.55;
  const breakout = moveMagnitude >= avgBody * 1.12;
  const recommendedCommandId = hazardScore >= 0.72 ? 'RUN' : compressed ? 'HOLD' : move > 0 ? 'LONG' : 'SHORT';
  const hazardFromAbove = move <= 0;
  const hazardLabel =
    hazardScore >= 0.72
      ? hazardFromAbove
        ? 'Wick flush'
        : 'Trap squeeze'
      : breakout
        ? move > 0
          ? 'Momentum ramp'
          : 'Breakdown lane'
        : compressed
          ? 'Range box'
          : null;
  const hazardPrice = hazardLabel ? roundPrice(hazardFromAbove ? nextCandle.low : nextCandle.high) : null;
  const bark =
    recommendedCommandId === 'RUN'
      ? 'Wick heat is too high. Survive this reveal first.'
      : recommendedCommandId === 'HOLD'
        ? 'The slice is compressed. Wait for the candle to show its hand.'
        : recommendedCommandId === 'LONG'
          ? 'Support is holding. Climb before the next body closes.'
          : 'The ceiling is heavy. Strike the rejection before it settles.';
  const clueParts = [
    `Support ${formatPrice(supportPrice)}`,
    `Resistance ${formatPrice(resistancePrice)}`,
    hazardLabel ? `${hazardLabel} ${hazardPrice ? `@ ${formatPrice(hazardPrice)}` : ''}`.trim() : null,
  ].filter((part): part is string => Boolean(part));

  return {
    currentClose: currentCandle.close,
    nextClose: nextCandle.close,
    move,
    range,
    avgBody,
    avgRange,
    supportPrice: roundPrice(supportPrice),
    resistancePrice: roundPrice(resistancePrice),
    hazardPrice,
    hazardLabel,
    hazardScore,
    recommendedCommandId,
    bark,
    clue: clueParts.join(' · '),
  };
}

function resolveTurn(commandId: FieldCommandId, snapshot: EncounterSnapshot): TurnResolution {
  const upward = snapshot.move > 0;
  const moveMagnitude = Math.abs(snapshot.move);
  const compressed = moveMagnitude <= snapshot.avgBody * 0.55;
  const hazardHigh = snapshot.hazardScore >= 0.72;
  const breakout = moveMagnitude >= snapshot.avgBody * 1.12;
  const followedCall = commandId === snapshot.recommendedCommandId;
  const bonusXp = followedCall ? 1 : 0;

  if (commandId === 'LONG') {
    if (upward) {
      return {
        outcome: 'ADVANTAGE',
        hpDelta: breakout ? 2 : 1,
        goldDelta: followedCall ? 3 : 2,
        xpDelta: 2 + bonusXp,
        summary: breakout
          ? 'LONG caught the breakout ridge and the squad climbed cleanly.'
          : 'LONG held the shelf and pushed the trail higher.',
      };
    }
    return {
      outcome: 'PUNISHED',
      hpDelta: hazardHigh ? -3 : -2,
      goldDelta: 0,
      xpDelta: 1,
      summary: hazardHigh
        ? 'LONG walked into a wick flush and the squad took heavy damage.'
        : 'LONG was early and the candle slipped under the squad.',
    };
  }

  if (commandId === 'SHORT') {
    if (!upward) {
      return {
        outcome: 'ADVANTAGE',
        hpDelta: breakout ? 2 : 1,
        goldDelta: followedCall ? 3 : 2,
        xpDelta: 2 + bonusXp,
        summary: breakout
          ? 'SHORT cracked the floor and the squad dropped through the lane.'
          : 'SHORT respected the ceiling and forced the breakdown.',
      };
    }
    return {
      outcome: 'PUNISHED',
      hpDelta: hazardHigh ? -3 : -2,
      goldDelta: 0,
      xpDelta: 1,
      summary: hazardHigh
        ? 'SHORT got squeezed against the wick and the retreat came late.'
        : 'SHORT pressed into a rebound and the lane pushed back.',
    };
  }

  if (commandId === 'HOLD') {
    if (compressed || hazardHigh) {
      return {
        outcome: 'SAFE',
        hpDelta: hazardHigh ? 1 : 0,
        goldDelta: compressed ? 1 : 0,
        xpDelta: 1 + bonusXp,
        summary: hazardHigh
          ? 'HOLD let the worst of the wick pass without forcing a bad entry.'
          : 'HOLD kept the squad patient while the range stayed tight.',
      };
    }
    return {
      outcome: 'PUNISHED',
      hpDelta: -1,
      goldDelta: 0,
      xpDelta: 1,
      summary: 'HOLD stayed safe, but the clean move passed without the squad.',
    };
  }

  if (hazardHigh || snapshot.recommendedCommandId === 'RUN') {
    return {
      outcome: 'ESCAPE',
      hpDelta: 1,
      goldDelta: 0,
      xpDelta: 1 + bonusXp,
      summary: 'RUN preserved HP and pulled the squad out before the trap could close.',
    };
  }

  return {
    outcome: 'SAFE',
    hpDelta: 0,
    goldDelta: 0,
    xpDelta: 0,
    summary: 'RUN stayed safe, but this slice was still offering a cleaner reward line.',
  };
}

function requireFrame(frameId: string) {
  const frame = getHistoricalChartFrame(frameId);
  if (!frame) {
    throw new Error(`Unknown field frame: ${frameId}`);
  }
  return frame;
}

function uniqueFrameList(frameIds: string[], frameId: string): string[] {
  return frameIds.includes(frameId) ? frameIds : [...frameIds, frameId];
}

function average(values: number[]): number {
  if (!values.length) {
    return 1;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatPrice(value: number): string {
  return roundPrice(value).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
}
