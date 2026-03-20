import { evalScenarios } from '$lib/data/seed';
import { buildScenarioCandles, getHistoricalChartFrame, type ChartCandle } from '$lib/engine/chart-frame-model';
import { battleCommandDefinitions, recommendBattleCommand } from '$lib/engine/battle-session';
import { evaluateAgentLoadout } from '$lib/engine/eval-engine';
import type {
  AgentRole,
  BattleCommandId,
  BattleCommandId as BattleCommandKey,
  BattleOutcome,
  BattlePhaseId,
  BattleSession,
  BattleTone,
  EvalAction,
  EvalReport,
  EvalScenario,
  OwnedAgent,
} from '$lib/types';

export type BattleCandle = ChartCandle;

export interface BattleZone {
  id: string;
  kind: 'SUPPORT' | 'RESISTANCE' | 'LIQUIDATION' | 'OBJECTIVE';
  price: number;
  label: string;
  tone: 'safe' | 'danger' | 'goal';
  strength: number;
}

interface BattleZoneTemplate {
  id: string;
  kind: BattleZone['kind'];
  label: string;
  tone: BattleZone['tone'];
  position: number;
}

export interface BattlePhase {
  id: BattlePhaseId;
  label: string;
  state: 'complete' | 'active' | 'queued';
}

export interface BattleMessage {
  id: string;
  speaker: string;
  role: AgentRole;
  tone: BattleTone;
  line: string;
}

export interface BattleCompanion {
  agent: OwnedAgent;
  xIndex: number;
  price: number;
  stance: 'advance' | 'signal' | 'brace' | 'finish';
}

export interface BattleCallout {
  id: string;
  xIndex: number;
  price: number;
  tone: BattleTone;
  label: string;
  detail: string;
}

export interface BattleCommandCard {
  id: BattleCommandId;
  label: string;
  summary: string;
  tone: 'primary' | 'secondary' | 'danger';
  hotkey: string;
  selected: boolean;
  lastUsed: boolean;
  recommended: boolean;
}

export interface BattleEncounterBeat {
  id: BattlePhaseId;
  label: string;
  detail: string;
  state: 'complete' | 'active' | 'queued';
}

export interface BattleEncounterContract {
  turnLabel: string;
  phaseLabel: string;
  question: string;
  successLine: string;
  failureLine: string;
  stakesLine: string;
  coachLine: string;
  recommendedCommandId: BattleCommandId;
  recommendedCommandLabel: string;
  recommendedReason: string;
  beats: BattleEncounterBeat[];
}

export interface BattleViewModel {
  scenario: EvalScenario;
  selectedAgent: OwnedAgent;
  squad: OwnedAgent[];
  report: EvalReport;
  session: BattleSession;
  stageFrame: {
    id: string | null;
    title: string;
    dateLabel: string;
    note: string;
    mode: 'historical' | 'scenario';
  };
  candles: BattleCandle[];
  zones: BattleZone[];
  phases: BattlePhase[];
  messages: BattleMessage[];
  companions: BattleCompanion[];
  callouts: BattleCallout[];
  commandCards: BattleCommandCard[];
  encounter: BattleEncounterContract;
  activeSlice: {
    start: number;
    end: number;
  };
  priceRange: {
    min: number;
    max: number;
    last: number;
  };
  verdictLabel: string;
  verdictTone: BattleTone;
  pressureLabel: string;
}

const roleOrder: AgentRole[] = ['SCOUT', 'ANALYST', 'RISK', 'EXECUTOR'];

const scenarioZoneTemplates: Record<EvalScenario['id'], BattleZoneTemplate[]> = {
  'btc-support-reclaim': [
    { id: 'support', kind: 'SUPPORT', position: 0.34, label: 'Support shelf', tone: 'safe' },
    { id: 'liquidation', kind: 'LIQUIDATION', position: 0.18, label: 'Long liquidation trap', tone: 'danger' },
    { id: 'resistance', kind: 'RESISTANCE', position: 0.73, label: 'Resistance wall', tone: 'danger' },
    { id: 'objective', kind: 'OBJECTIVE', position: 0.88, label: 'Breakout claim', tone: 'goal' },
  ],
  'eth-range-fakeout': [
    { id: 'resistance', kind: 'RESISTANCE', position: 0.78, label: 'Top wick rejection', tone: 'danger' },
    { id: 'support', kind: 'SUPPORT', position: 0.33, label: 'Range floor', tone: 'safe' },
    { id: 'liquidation', kind: 'LIQUIDATION', position: 0.88, label: 'Short squeeze beam', tone: 'danger' },
    { id: 'objective', kind: 'OBJECTIVE', position: 0.15, label: 'Collapse target', tone: 'goal' },
  ],
  'sol-breakout-ladder': [
    { id: 'support', kind: 'SUPPORT', position: 0.28, label: 'Base shelf', tone: 'safe' },
    { id: 'liquidation', kind: 'LIQUIDATION', position: 0.16, label: 'Failed-break trap', tone: 'danger' },
    { id: 'resistance', kind: 'RESISTANCE', position: 0.66, label: 'Breakout wall', tone: 'danger' },
    { id: 'objective', kind: 'OBJECTIVE', position: 0.9, label: 'Momentum ladder', tone: 'goal' },
  ],
};

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

function toneFromScore(score: number): BattleTone {
  if (score >= 85) return 'good';
  if (score >= 72) return 'info';
  if (score >= 58) return 'warn';
  return 'danger';
}

function resolveSquad(selectedAgent: OwnedAgent, roster: OwnedAgent[]): OwnedAgent[] {
  const familyPool = roster.filter((agent) => agent.family === selectedAgent.family);
  const seen = new Set<string>();
  const resolved: OwnedAgent[] = [];

  for (const role of roleOrder) {
    const familyMatch = familyPool.find((agent) => agent.role === role);
    const fallback = roster.find((agent) => agent.role === role && !seen.has(agent.id));
    const next = familyMatch ?? fallback;
    if (next && !seen.has(next.id)) {
      resolved.push(next);
      seen.add(next.id);
    }
  }

  if (!seen.has(selectedAgent.id) && resolved.length > 0) {
    resolved[0] = selectedAgent;
  }

  return resolved;
}

function buildVerdict(session: BattleSession, scenario: EvalScenario, report: EvalReport): Pick<BattleViewModel, 'verdictLabel' | 'verdictTone' | 'pressureLabel'> {
  if (session.outcome === 'WIN') {
    return {
      verdictLabel: scenario.targetAction === 'LONG' ? 'Battle won: breakout owned' : 'Battle won: collapse confirmed',
      verdictTone: 'good',
      pressureLabel: scenario.targetAction === 'LONG' ? 'Your squad converted the climb into owned territory' : 'Your squad forced the breakdown before the rebound',
    };
  }
  if (session.outcome === 'LOSS') {
    return {
      verdictLabel: scenario.targetAction === 'LONG' ? 'Battle lost: floor gave way' : 'Battle lost: rebound punished the short',
      verdictTone: 'danger',
      pressureLabel: scenario.targetAction === 'LONG' ? 'The rival pressure cracked support before the wall broke' : 'The rival kept enough strength to survive the collapse attempt',
    };
  }
  if (session.structureIntegrity <= 36) {
    return {
      verdictLabel: 'Objective almost broken',
      verdictTone: 'good',
      pressureLabel: 'One clean command can decide the clash',
    };
  }
  if (session.trapRisk >= 70 || session.supportIntegrity <= 32) {
    return {
      verdictLabel: 'Trap pressure escalating',
      verdictTone: 'warn',
      pressureLabel: 'The next command has to stabilize the active slice',
    };
  }
  return {
    verdictLabel: report.totalScore >= 72 ? 'Contested hold, but still winnable' : 'Battle still unstable',
    verdictTone: report.totalScore >= 72 ? 'info' : 'warn',
    pressureLabel:
      scenario.targetAction === 'LONG'
        ? 'Your squad is still climbing from below while rival pressure drops from above'
        : 'Your squad is still forcing the top-down collapse while the rival tries to rebound',
  };
}

function buildPhases(session: BattleSession): BattlePhase[] {
  const order: BattlePhaseId[] = ['APPROACH', 'LOCK', 'COMMIT', 'RESOLVE'];
  const activeIndex = order.indexOf(session.phase);
  return order.map((id, index) => ({
    id,
    label: id[0] + id.slice(1).toLowerCase(),
    state: index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'queued',
  }));
}

function roleLine(role: AgentRole, session: BattleSession, report: EvalReport, scenario: EvalScenario): string {
  const latest = session.logs[0];
  const leadInstinct = report.trustedInstincts[0]?.label ?? 'trusted instinct';
  if (role === 'SCOUT') {
    if (session.lastCommandId === 'HOLD') return `Lane updated from ${report.proofFrameTitle}. ${scenario.structureHint}`;
    return report.accuracyScore >= 75 ? `Lane mapped through ${leadInstinct.toLowerCase()}. ${scenario.structureHint}` : 'Lane still noisy. First touch is not enough.';
  }
  if (role === 'ANALYST') {
    if (session.lastCommandId === report.action) return `Commit locked. ${leadInstinct} is carrying the squad into the live structure.`;
    return report.reasoningScore >= 75 ? `Pattern match is clean because ${leadInstinct.toLowerCase()} stayed louder than ${report.weakLink.toLowerCase()}.` : 'Story is still muddy. Structure and memory are fighting.';
  }
  if (role === 'RISK') {
    if (session.trapRisk >= 66) return 'Trap pressure is live. Veto the next bad commitment.';
    if (session.lastCommandId === 'RUN') return 'The squad bailed early. Footing is stable for now.';
    return report.riskScore >= 75 ? 'Floor is defended. Trap risk is controlled.' : 'The floor is fragile. Protect it first.';
  }
  if (latest?.tone === 'good') return 'Finish window open. One more command can close the clash.';
  if (session.phase === 'COMMIT') return 'The squad is ready to convert this read into structure damage.';
  return 'Still waiting for a cleaner finish signal.';
}

function buildMessages(squad: OwnedAgent[], session: BattleSession, report: EvalReport, scenario: EvalScenario): BattleMessage[] {
  return squad.map((agent) => {
    const scoreByRole =
      agent.role === 'SCOUT'
        ? report.accuracyScore
        : agent.role === 'ANALYST'
          ? report.reasoningScore
          : agent.role === 'RISK'
            ? report.riskScore
            : report.totalScore;

    return {
      id: `${agent.id}-msg`,
      speaker: agent.name,
      role: agent.role,
      tone: toneFromScore(scoreByRole),
      line: roleLine(agent.role, session, report, scenario),
    };
  });
}

function stanceForRole(role: AgentRole, commandId: BattleCommandKey | null): BattleCompanion['stance'] {
  if (commandId === 'RUN' && role === 'RISK') return 'brace';
  if (commandId === 'HOLD' && (role === 'SCOUT' || role === 'ANALYST')) return 'signal';
  if ((commandId === 'LONG' || commandId === 'SHORT') && role === 'EXECUTOR') return 'finish';
  if ((commandId === 'LONG' || commandId === 'SHORT') && (role === 'SCOUT' || role === 'ANALYST')) return 'advance';
  return role === 'RISK' ? 'brace' : role === 'EXECUTOR' ? 'finish' : 'signal';
}

function buildCompanions(squad: OwnedAgent[], candles: BattleCandle[], action: EvalAction, session: BattleSession): BattleCompanion[] {
  const startIndex = Math.max(0, candles.length - 8);
  const activeCandles = candles.slice(startIndex);
  const low = Math.min(...activeCandles.map((candle) => candle.low));
  const high = Math.max(...activeCandles.map((candle) => candle.high));
  const span = high - low;
  const progressRatio = clamp((100 - session.structureIntegrity + session.pushMomentum - session.rivalPressure * 0.35) / 120, 0.08, 0.94);
  const footingPenalty = (100 - session.supportIntegrity) / 100;

  return squad.map((agent, index) => {
    const laneOffset = action === 'LONG' ? index : -index;
    const xIndex = clamp(
      Math.round(startIndex + 1 + progressRatio * 5 + laneOffset * 0.45),
      startIndex,
      candles.length - 1,
    );
    const ladder = span * (0.18 + index * 0.12);
    const price =
      action === 'LONG'
        ? low + ladder + progressRatio * span * 0.32 - footingPenalty * span * 0.08
        : high - ladder - progressRatio * span * 0.32 + footingPenalty * span * 0.08;

    return {
      agent,
      xIndex,
      price,
      stance: stanceForRole(agent.role, session.lastCommandId),
    };
  });
}

function buildCallouts(messages: BattleMessage[], companions: BattleCompanion[], session: BattleSession): BattleCallout[] {
  const latestLog = session.logs[0];
  return companions.map((companion, index) => ({
    id: `${companion.agent.id}-callout`,
    xIndex: companion.xIndex,
    price: companion.price + (index % 2 === 0 ? 4.2 : -3.8),
    tone: index === 0 && latestLog ? latestLog.tone : messages[index]?.tone ?? 'info',
    label:
      index === 0 && latestLog
        ? latestLog.title
        : companion.agent.role === 'SCOUT'
          ? 'Lane read'
          : companion.agent.role === 'ANALYST'
            ? 'Pattern read'
            : companion.agent.role === 'RISK'
              ? session.lastCommandId === 'RUN'
                ? 'Retreat line'
                : 'Risk line'
              : 'Commit signal',
    detail: index === 0 && latestLog ? latestLog.summary : messages[index]?.line ?? companion.agent.recentLesson,
  }));
}

const encounterBeatBlueprints: Record<BattlePhaseId, Pick<BattleEncounterBeat, 'label' | 'detail'>> = {
  APPROACH: {
    label: 'Read Lane',
    detail: 'Confirm the live path.',
  },
  LOCK: {
    label: 'Hold Floor',
    detail: 'Protect the thesis line.',
  },
  COMMIT: {
    label: 'Break Gate',
    detail: 'Turn the read into damage.',
  },
  RESOLVE: {
    label: 'Carry Verdict',
    detail: 'Decide what survives.',
  },
};

function buildEncounterBeats(session: BattleSession): BattleEncounterBeat[] {
  const order: BattlePhaseId[] = ['APPROACH', 'LOCK', 'COMMIT', 'RESOLVE'];
  const activeIndex = order.indexOf(session.phase);

  return order.map((id, index) => ({
    id,
    ...encounterBeatBlueprints[id],
    state: index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'queued',
  }));
}

function buildRecommendationReason(
  commandId: BattleCommandId,
  session: BattleSession,
  report: EvalReport,
  scenario: EvalScenario,
): string {
  if (commandId === 'RUN') {
    return session.trapRisk >= 64 || session.supportIntegrity <= 42
      ? 'Trap pressure is live and survival matters more than greed on this turn.'
      : 'The floor is too unstable to force a clean commit right now.';
  }
  if (commandId === 'HOLD') {
    return session.revealLevel === 0
      ? `The squad still needs one cleaner read before it can trust this ${scenario.targetAction.toLowerCase()} line.`
      : `One more pause can steady ${report.weakLink.toLowerCase()} before the real commit.`;
  }
  if (commandId === 'LONG' || commandId === 'SHORT') {
    if (commandId === scenario.targetAction) {
      return session.structureIntegrity <= 48 || session.phase === 'COMMIT'
        ? `The gate is vulnerable now, so ${commandId} is the clean finish.`
        : `The read is clean enough to commit with ${commandId} instead of drifting.`;
    }
    return `${commandId} is the wrong side of this slice. The chart is asking for ${scenario.targetAction} instead.`;
  }
  return session.phase === 'APPROACH'
    ? 'Early certainty matters more than heroics. Read the lane before you commit.'
    : `Your accuracy and coordination are strong enough to drive a cleaner ${scenario.targetAction.toLowerCase()} push.`;
}

function buildEncounterContract(
  session: BattleSession,
  report: EvalReport,
  scenario: EvalScenario,
  recommendedCommandId: BattleCommandId,
): BattleEncounterContract {
  const recommendedCommandLabel = battleCommandDefinitions.find((item) => item.id === recommendedCommandId)?.label ?? recommendedCommandId;
  const beats = buildEncounterBeats(session);
  const phaseDetail = encounterBeatBlueprints[session.phase];
  const turnLabel =
    session.outcome === 'ONGOING'
      ? `Turn ${Math.min(session.turn, session.turnLimit)} of ${session.turnLimit}`
      : session.outcome === 'WIN'
        ? 'Clash won'
        : 'Clash lost';

  if (session.outcome === 'WIN') {
    return {
      turnLabel,
      phaseLabel: 'Carry the lesson home',
      question: 'What survives this proof before the squad leaves the field?',
      successLine: 'Lock the clean read into memory and preserve the mutation worth carrying.',
      failureLine: 'If you leave without a verdict, even a win collapses back into noise.',
      stakesLine: 'A win only matters if you decide what the squad keeps.',
      coachLine: 'Choose what survives this proof before returning to the field.',
      recommendedCommandId,
      recommendedCommandLabel,
      recommendedReason: 'The clash is already decided. The next real action is the trainer verdict below.',
      beats,
    };
  }

  if (session.outcome === 'LOSS') {
    return {
      turnLabel,
      phaseLabel: 'Stabilize the return',
      question: 'What has to be repaired before the next gate?',
      successLine: 'Name the bad line clearly and quarantine or revert before re-entering.',
      failureLine: 'If you carry panic forward, the next run starts compromised before it begins.',
      stakesLine: 'A bad proof still has value if it becomes care instead of denial.',
      coachLine: 'Do not leave this loss as mood. Turn it into a concrete care decision.',
      recommendedCommandId,
      recommendedCommandLabel,
      recommendedReason: 'The clash is over. The remaining play is to convert failure into a clean verdict.',
      beats,
    };
  }

  if (session.phase === 'APPROACH') {
    return {
      turnLabel,
      phaseLabel: 'Read the lane',
      question: scenario.targetAction === 'LONG' ? 'Is the floor real enough to climb?' : 'Is the ceiling weak enough to short?',
      successLine:
        scenario.targetAction === 'LONG'
          ? 'Leave this turn with lower trap risk and a cleaner path upward.'
          : 'Leave this turn with lower rebound risk and a cleaner fade setup.',
      failureLine:
        scenario.targetAction === 'LONG'
          ? 'If you misread the floor, the squad climbs directly into a trap.'
          : 'If you misread the ceiling, the squad shorts straight into a rebound.',
      stakesLine: 'This turn is for certainty, not heroics.',
      coachLine: `Get one clear read on ${report.weakLink.toLowerCase()} before you try to finish the clash.`,
      recommendedCommandId,
      recommendedCommandLabel,
      recommendedReason: buildRecommendationReason(recommendedCommandId, session, report, scenario),
      beats,
    };
  }

  if (session.phase === 'LOCK') {
    return {
      turnLabel,
      phaseLabel: 'Hold the floor',
      question: 'What has to stay stable before the squad commits?',
      successLine: 'Protect support, cancel the bad line, and keep the thesis playable.',
      failureLine: 'If footing breaks now, the commit turn becomes panic instead of proof.',
      stakesLine: 'You are defending the structure that makes this thesis valid.',
      coachLine: session.supportIntegrity <= 46 ? 'Footing is thin. Protect it before you ask for damage.' : phaseDetail.detail,
      recommendedCommandId,
      recommendedCommandLabel,
      recommendedReason: buildRecommendationReason(recommendedCommandId, session, report, scenario),
      beats,
    };
  }

  if (session.phase === 'COMMIT') {
    return {
      turnLabel,
      phaseLabel: scenario.targetAction === 'LONG' ? 'Break the gate' : 'Force the drop',
      question: scenario.targetAction === 'LONG' ? 'Is this the turn to break through?' : 'Is this the turn to force the collapse?',
      successLine: 'Convert the read into objective damage before rival pressure resets.',
      failureLine: 'If you drift now, the rival carries enough pressure to deny the finish.',
      stakesLine: 'This is where judgment turns into consequence.',
      coachLine: session.structureIntegrity <= 40 ? 'One clean push can end the clash.' : 'Commit only if the lane is already earned.',
      recommendedCommandId,
      recommendedCommandLabel,
      recommendedReason: buildRecommendationReason(recommendedCommandId, session, report, scenario),
      beats,
    };
  }

  return {
    turnLabel,
    phaseLabel: 'Carry the verdict',
    question: 'Did your squad leave the slice owning more pressure than resistance?',
    successLine: 'Exit with control, then decide what the squad keeps from this proof.',
    failureLine: 'If the rival leaves stronger, the thesis fails even if the chart looked close.',
    stakesLine: 'The final exchange decides whether this run becomes proof or noise.',
    coachLine: 'Close the clash cleanly, then record the lesson.',
    recommendedCommandId,
    recommendedCommandLabel,
    recommendedReason: buildRecommendationReason(recommendedCommandId, session, report, scenario),
    beats,
  };
}

function buildCommandCards(session: BattleSession, recommendedCommandId: BattleCommandId): BattleCommandCard[] {
  return battleCommandDefinitions.map((definition) => ({
    id: definition.id,
    label: definition.label,
    summary: definition.summary,
    tone: definition.id === 'RUN' ? 'danger' : definition.id === 'HOLD' ? 'secondary' : 'primary',
    hotkey: definition.hotkey,
    selected: definition.id === session.selectedCommandId,
    lastUsed: definition.id === session.lastCommandId,
    recommended: definition.id === recommendedCommandId,
  }));
}

function buildStageFrame(session: BattleSession, scenario: EvalScenario): BattleViewModel['stageFrame'] {
  const frame = session.entryFrameId ? getHistoricalChartFrame(session.entryFrameId) : null;
  if (frame) {
    return {
      id: frame.id,
      title: frame.title,
      dateLabel: frame.dateLabel,
      note: frame.note,
      mode: 'historical',
    };
  }

  return {
    id: null,
    title: scenario.label,
    dateLabel: `${scenario.symbol} ${scenario.timeframe}`,
    note: scenario.objective,
    mode: 'scenario',
  };
}

function buildZones(scenario: EvalScenario, session: BattleSession, priceRange: { min: number; max: number }): BattleZone[] {
  const span = priceRange.max - priceRange.min || 1;
  return scenarioZoneTemplates[scenario.id].map((zone) => ({
    id: zone.id,
    kind: zone.kind,
    label: zone.label,
    tone: zone.tone,
    price: priceRange.min + span * zone.position,
    strength:
      zone.kind === 'SUPPORT'
        ? session.supportIntegrity
        : zone.kind === 'LIQUIDATION'
          ? session.trapRisk
          : session.structureIntegrity,
  }));
}

export function buildBattleView(selectedAgent: OwnedAgent, roster: OwnedAgent[], session: BattleSession): BattleViewModel {
  const scenario = findScenario(session.scenarioId);
  const report = evaluateAgentLoadout(selectedAgent, selectedAgent.loadout, session.scenarioId);
  const recommendedCommandId = recommendBattleCommand(session, selectedAgent);
  const squad = resolveSquad(selectedAgent, roster);
  const stageFrame = buildStageFrame(session, scenario);
  const candles = stageFrame.mode === 'historical'
    ? (getHistoricalChartFrame(stageFrame.id ?? '')?.candles ?? buildScenarioCandles(scenario.id, 20))
    : buildScenarioCandles(scenario.id, 20);
  const candleMin = Math.min(...candles.map((candle) => candle.low));
  const candleMax = Math.max(...candles.map((candle) => candle.high));
  const zones = buildZones(scenario, session, { min: candleMin, max: candleMax });
  const companions = buildCompanions(squad, candles, report.action, session);
  const messages = buildMessages(squad, session, report, scenario);
  const callouts = buildCallouts(messages, companions, session);
  const activeSlice = { start: Math.max(0, candles.length - 8), end: candles.length - 1 };
  const stageSpan = candleMax - candleMin || 1;
  const stagePadding = Math.max(2, stageSpan * 0.08);
  const minPrice = Math.min(...candles.map((candle) => candle.low), ...zones.map((zone) => zone.price)) - stagePadding;
  const maxPrice = Math.max(...candles.map((candle) => candle.high), ...zones.map((zone) => zone.price)) + stagePadding;

  return {
    scenario,
    selectedAgent,
    squad,
    report,
    session,
    stageFrame,
    candles,
    zones,
    phases: buildPhases(session),
    messages,
    companions,
    callouts,
    commandCards: buildCommandCards(session, recommendedCommandId),
    encounter: buildEncounterContract(session, report, scenario, recommendedCommandId),
    activeSlice,
    priceRange: {
      min: minPrice,
      max: maxPrice,
      last: candles[candles.length - 1]?.close ?? minPrice,
    },
    ...buildVerdict(session, scenario, report),
  };
}
