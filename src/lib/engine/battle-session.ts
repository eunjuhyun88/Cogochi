import type {
  BattleCommandId,
  BattleEntryGate,
  BattleOutcome,
  BattlePhaseId,
  BattleSession,
  BattleTone,
  BattleTurnLog,
  EvalScenario,
  OwnedAgent,
} from '$lib/types';
import { evalScenarios } from '$lib/data/seed';
import { getHistoricalChartFrame } from '$lib/engine/chart-frame-model';
import { evaluateAgentLoadout } from '$lib/engine/eval-engine';

export interface BattleCommandDefinition {
  id: BattleCommandId;
  label: string;
  summary: string;
  hotkey: string;
}

export const battleCommandDefinitions: BattleCommandDefinition[] = [
  {
    id: 'FOCUS_TAP',
    label: 'Focus Tap',
    summary: 'Supercharge the next push through the active lane.',
    hotkey: '1',
  },
  {
    id: 'MEMORY_PULSE',
    label: 'Memory Pulse',
    summary: 'Force one retrieval spike before the squad commits.',
    hotkey: '2',
  },
  {
    id: 'RISK_VETO',
    label: 'Risk Veto',
    summary: 'Cancel a dangerous line and protect the floor.',
    hotkey: '3',
  },
  {
    id: 'RETARGET',
    label: 'Retarget',
    summary: 'Redirect squad pressure straight into the live objective.',
    hotkey: '4',
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function findScenario(scenarioId: string): EvalScenario {
  const scenario = evalScenarios.find((entry) => entry.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  return scenario;
}

function normalizeGate(entryGate: BattleEntryGate | null | undefined): BattleEntryGate {
  return entryGate ?? 'DIRECT';
}

function phaseForTurn(turn: number, outcome: BattleOutcome): BattlePhaseId {
  if (outcome !== 'ONGOING') {
    return 'RESOLVE';
  }
  if (turn <= 1) return 'APPROACH';
  if (turn === 2) return 'LOCK';
  if (turn === 3) return 'COMMIT';
  return 'RESOLVE';
}

function recommendCommand(session: BattleSession, agent: OwnedAgent): BattleCommandId {
  if (session.trapRisk >= 64 || session.supportIntegrity <= 42) {
    return 'RISK_VETO';
  }
  if (session.revealLevel === 0 || agent.lastComparison?.deltas.retrievalScore === undefined) {
    return 'MEMORY_PULSE';
  }
  if (session.structureIntegrity <= 48 || session.phase === 'COMMIT') {
    return 'RETARGET';
  }
  return 'FOCUS_TAP';
}

function createLog(turn: number, commandId: BattleCommandId | null, title: string, summary: string, tone: BattleTone): BattleTurnLog {
  return {
    id: `${turn}-${commandId ?? 'boot'}`,
    turn,
    commandId,
    title,
    summary,
    tone,
  };
}

export function createBattleSession(
  agent: OwnedAgent,
  scenarioId: string,
  entryFrameId: string | null = null,
  entryGate: BattleEntryGate | null = 'DIRECT',
  doctrineSessionId: string | null = null,
  doctrineSessionTitle: string | null = null,
  doctrineSessionPackId: string | null = null,
): BattleSession {
  const scenario = findScenario(scenarioId);
  const report = evaluateAgentLoadout(agent, agent.loadout, scenarioId);
  const entryFrame = entryFrameId ? getHistoricalChartFrame(entryFrameId) : null;
  const gateMode = normalizeGate(entryGate);
  const gateTrapBias = gateMode === 'SPAR' ? -12 : gateMode === 'PROOF' ? 8 : 0;
  const gateSupportBias = gateMode === 'SPAR' ? 12 : gateMode === 'PROOF' ? -4 : 0;
  const gateStructureBias = gateMode === 'SPAR' ? -12 : gateMode === 'PROOF' ? 10 : 0;
  const gatePressureBias = gateMode === 'SPAR' ? -10 : gateMode === 'PROOF' ? 8 : 0;
  const trapBias = (scenario.targetAction === 'LONG' ? 12 : 8) + gateTrapBias;
  const supportBias = (scenario.targetAction === 'LONG' ? 6 : 2) + gateSupportBias;
  const turnLimit = gateMode === 'SPAR' ? 3 : 4;
  const initial: BattleSession = {
    agentId: agent.id,
    scenarioId,
    entryFrameId,
    entryGate: gateMode,
    doctrineSessionId,
    doctrineSessionTitle,
    doctrineSessionPackId,
    proofArtifactId: null,
    turnLimit,
    writebackApplied: false,
    turn: 1,
    phase: 'APPROACH',
    outcome: 'ONGOING',
    selectedCommandId: 'FOCUS_TAP',
    lastCommandId: null,
    structureIntegrity: clamp(118 - Math.round(report.totalScore * 0.55) + gateStructureBias, 32, 96),
    supportIntegrity: clamp(Math.round(report.riskScore * 0.62) + supportBias, 28, 92),
    trapRisk: clamp(108 - Math.round(report.riskScore * 0.72) + trapBias, 12, 72),
    pushMomentum: clamp(Math.round((report.accuracyScore + report.coordinationScore) * 0.34), 20, 72),
    rivalPressure: clamp(108 - Math.round(report.totalScore * 0.68) + gatePressureBias, 18, 78),
    focusCharge: 0,
    revealLevel: 0,
    logs: [
      createLog(
        0,
        null,
        entryFrame
          ? gateMode === 'SPAR'
            ? `Spar gate opened at ${entryFrame.title}`
            : gateMode === 'PROOF'
              ? `Proof gate opened at ${entryFrame.title}`
              : `Entered ${entryFrame.title}`
          : scenario.targetAction === 'LONG'
            ? 'Clash starting below the wall'
            : 'Clash starting above the floor',
        entryFrame
          ? gateMode === 'SPAR'
            ? `${entryFrame.dateLabel}. Safe rehearsal rules are active before the live proof. ${entryFrame.note}`
            : gateMode === 'PROOF'
              ? `${entryFrame.dateLabel}. Rival pressure is live and the verdict will carry full weight. ${entryFrame.note}`
              : `${entryFrame.dateLabel}. ${entryFrame.note}`
          : scenario.targetAction === 'LONG'
            ? 'Your squad enters from below and must earn the climb before the wall breaks.'
            : 'Your squad enters from above and must force the collapse before the rebound.',
        'info',
      ),
    ],
  };

  return {
    ...initial,
    selectedCommandId: recommendCommand(initial, agent),
  };
}

export function selectBattleCommand(session: BattleSession, commandId: BattleCommandId): BattleSession {
  if (session.outcome !== 'ONGOING') {
    return session;
  }
  return {
    ...session,
    selectedCommandId: commandId,
  };
}

export function moveBattleCommandSelection(session: BattleSession, direction: 'left' | 'right' | 'up' | 'down'): BattleSession {
  if (session.outcome !== 'ONGOING') {
    return session;
  }

  const commands = battleCommandDefinitions.map((item) => item.id);
  const index = commands.indexOf(session.selectedCommandId);
  const safeIndex = index === -1 ? 0 : index;
  let nextIndex = safeIndex;

  if (direction === 'left') nextIndex = safeIndex % 2 === 0 ? safeIndex + 1 : safeIndex - 1;
  if (direction === 'right') nextIndex = safeIndex % 2 === 0 ? safeIndex + 1 : safeIndex - 1;
  if (direction === 'up') nextIndex = safeIndex < 2 ? safeIndex + 2 : safeIndex - 2;
  if (direction === 'down') nextIndex = safeIndex < 2 ? safeIndex + 2 : safeIndex - 2;

  nextIndex = clamp(nextIndex, 0, commands.length - 1);

  return {
    ...session,
    selectedCommandId: commands[nextIndex] ?? session.selectedCommandId,
  };
}

export function executeBattleCommand(session: BattleSession, agent: OwnedAgent): BattleSession {
  if (session.outcome !== 'ONGOING') {
    return session;
  }

  const report = evaluateAgentLoadout(agent, agent.loadout, session.scenarioId);
  const scenario = findScenario(session.scenarioId);
  const commandId = session.selectedCommandId;

  let pushGain = 0;
  let supportDelta = 0;
  let structureDamage = 0;
  let trapDelta = 0;
  let rivalDelta = 0;
  let focusDelta = 0;
  let revealDelta = 0;
  let title = '';
  let summary = '';

  if (commandId === 'FOCUS_TAP') {
    pushGain = 10 + Math.round(report.accuracyScore * 0.08) + Math.round(session.focusCharge * 0.45);
    structureDamage = 8 + Math.round(report.coordinationScore * 0.07) + (session.revealLevel > 0 ? 4 : 0);
    trapDelta = report.riskScore >= 72 ? 4 : 10;
    rivalDelta = 3;
    focusDelta = -Math.min(session.focusCharge, 2);
    title = scenario.targetAction === 'LONG' ? 'Focus Tap sharpened the climb' : 'Focus Tap sharpened the collapse';
    summary = 'One agent was supercharged and the next lane push hit harder, but speed increased exposure.';
  } else if (commandId === 'MEMORY_PULSE') {
    pushGain = 5 + Math.round(report.reasoningScore * 0.05);
    structureDamage = 6 + Math.round(report.retrievalScore * 0.05);
    trapDelta = -15 - Math.round(report.retrievalScore * 0.05);
    rivalDelta = 6;
    focusDelta = 1;
    revealDelta = 1;
    title = 'Memory Pulse pulled an old replay into the fight';
    summary = 'Retrieval spiked, the trap pattern became clearer, and the squad committed with better context.';
  } else if (commandId === 'RISK_VETO') {
    pushGain = 2 + Math.round(report.riskScore * 0.03);
    structureDamage = 4 + Math.round(report.riskScore * 0.04);
    trapDelta = -18 - Math.round(report.riskScore * 0.05);
    rivalDelta = 12;
    supportDelta = 16 + Math.round(report.riskScore * 0.06);
    title = 'Risk Veto protected the floor';
    summary = 'A dangerous line was canceled, support was reinforced, and rival pressure lost momentum.';
  } else {
    pushGain = 8 + Math.round(report.coordinationScore * 0.06);
    structureDamage = 12 + Math.round(report.accuracyScore * 0.08) + (session.revealLevel > 0 ? 6 : 0);
    trapDelta = session.revealLevel > 0 ? 1 : 8;
    rivalDelta = 4;
    focusDelta = -Math.min(session.focusCharge, 1);
    title = 'Retarget redirected the squad into the live objective';
    summary = 'The team stopped drifting and pushed directly into the wall zone.';
  }

  const rivalStrike = clamp(
    Math.round(session.rivalPressure * 0.22 + session.trapRisk * 0.08 - report.riskScore * 0.07 - rivalDelta),
    4,
    18,
  );

  const nextStructureIntegrity = clamp(session.structureIntegrity - structureDamage, 0, 100);
  const nextSupportIntegrity = clamp(session.supportIntegrity + supportDelta - rivalStrike, 0, 100);
  const nextTrapRisk = clamp(session.trapRisk + trapDelta + Math.max(0, rivalStrike - 10), 0, 100);
  const nextPushMomentum = clamp(session.pushMomentum + pushGain - Math.max(0, rivalStrike - 7), 0, 100);
  const nextRivalPressure = clamp(
    session.rivalPressure + 7 - rivalDelta - Math.round(report.coordinationScore * 0.03),
    0,
    100,
  );
  const nextFocusCharge = clamp(session.focusCharge + focusDelta, 0, 4);
  const nextRevealLevel = clamp(session.revealLevel + revealDelta, 0, 2);

  let outcome: BattleOutcome = 'ONGOING';
  let tone: BattleTone = 'info';

  if (nextStructureIntegrity <= 0) {
    outcome = 'WIN';
    tone = 'good';
    title = scenario.targetAction === 'LONG' ? 'Breakout wall shattered' : 'Collapse target gave way';
    summary = 'The command sequence translated into a clean finish and the objective broke.';
  } else if (nextSupportIntegrity <= 0 || nextTrapRisk >= 100) {
    outcome = 'LOSS';
    tone = 'danger';
    title = nextTrapRisk >= 100 ? 'Liquidation trap snapped shut' : 'Support collapsed under pressure';
    summary = 'The squad lost the footing it needed and the clash turned against the read.';
  } else if (session.turn >= session.turnLimit) {
    outcome = nextPushMomentum + nextSupportIntegrity >= nextRivalPressure + nextStructureIntegrity * 0.45 ? 'WIN' : 'LOSS';
    tone = outcome === 'WIN' ? 'good' : 'warn';
    title =
      outcome === 'WIN'
        ? session.entryGate === 'SPAR'
          ? 'Spar loop ended with a clean rehearsal'
          : 'Final exchange favored the squad'
        : session.entryGate === 'PROOF'
          ? 'Proof gate denied the current mutation'
          : 'Final exchange favored the rival';
    summary =
      outcome === 'WIN'
        ? 'The squad left the active slice with more owned pressure than resistance.'
        : 'The rival kept enough pressure alive to deny the finish.';
  } else {
    const net = structureDamage + supportDelta * 0.4 - rivalStrike - Math.max(0, trapDelta);
    tone = net >= 12 ? 'good' : net >= 4 ? 'info' : net >= -4 ? 'warn' : 'danger';
  }

  const nextTurn = outcome === 'ONGOING' ? session.turn + 1 : session.turn;
  const nextSession: BattleSession = {
    ...session,
    turn: nextTurn,
    phase: phaseForTurn(nextTurn, outcome),
    outcome,
    lastCommandId: commandId,
    selectedCommandId: session.selectedCommandId,
    structureIntegrity: nextStructureIntegrity,
    supportIntegrity: nextSupportIntegrity,
    trapRisk: nextTrapRisk,
    pushMomentum: nextPushMomentum,
    rivalPressure: nextRivalPressure,
    focusCharge: nextFocusCharge,
    revealLevel: nextRevealLevel,
    logs: [
      createLog(session.turn, commandId, title, summary, tone),
      ...session.logs,
    ].slice(0, 8),
  };

  return {
    ...nextSession,
    selectedCommandId: outcome === 'ONGOING' ? recommendCommand(nextSession, agent) : nextSession.selectedCommandId,
  };
}
