import { evalScenarios } from '$lib/data/seed';
import { getReferenceProofFrame } from '$lib/engine/chart-frame-model';
import type {
  AgentInstinct,
  ConfidenceStyle,
  EvalComparison,
  EvalReport,
  EvalScenario,
  IndicatorPresetId,
  MemoryBias,
  MutationDecision,
  MutationGene,
  OwnedAgent,
  ScriptPresetId,
  AgentMutation,
  TrainingLoadout,
} from '$lib/types';

const indicatorFit: Record<IndicatorPresetId, Record<EvalScenario['id'], number>> = {
  TREND_RIBBON: {
    'btc-support-reclaim': 0.58,
    'eth-range-fakeout': 0.34,
    'sol-breakout-ladder': 0.92,
  },
  STRUCTURE_MAP: {
    'btc-support-reclaim': 0.9,
    'eth-range-fakeout': 0.63,
    'sol-breakout-ladder': 0.68,
  },
  LIQUIDITY_LENS: {
    'btc-support-reclaim': 0.52,
    'eth-range-fakeout': 0.94,
    'sol-breakout-ladder': 0.48,
  },
};

const scriptFit: Record<ScriptPresetId, Record<EvalScenario['id'], number>> = {
  BREAKOUT_CONFIRM: {
    'btc-support-reclaim': 0.61,
    'eth-range-fakeout': 0.39,
    'sol-breakout-ladder': 0.95,
  },
  SUPPORT_DEFEND: {
    'btc-support-reclaim': 0.96,
    'eth-range-fakeout': 0.54,
    'sol-breakout-ladder': 0.51,
  },
  TRAP_FADE: {
    'btc-support-reclaim': 0.44,
    'eth-range-fakeout': 0.93,
    'sol-breakout-ladder': 0.36,
  },
};

const memoryFit: Record<MemoryBias, Record<EvalScenario['id'], number>> = {
  FAILURES: {
    'btc-support-reclaim': 0.53,
    'eth-range-fakeout': 0.93,
    'sol-breakout-ladder': 0.42,
  },
  PLAYBOOKS: {
    'btc-support-reclaim': 0.88,
    'eth-range-fakeout': 0.62,
    'sol-breakout-ladder': 0.64,
  },
  WINS: {
    'btc-support-reclaim': 0.56,
    'eth-range-fakeout': 0.45,
    'sol-breakout-ladder': 0.9,
  },
};

const confidenceFit: Record<ConfidenceStyle, Record<EvalScenario['id'], number>> = {
  CONSERVATIVE: {
    'btc-support-reclaim': 0.64,
    'eth-range-fakeout': 0.94,
    'sol-breakout-ladder': 0.38,
  },
  BALANCED: {
    'btc-support-reclaim': 0.92,
    'eth-range-fakeout': 0.68,
    'sol-breakout-ladder': 0.65,
  },
  AGGRESSIVE: {
    'btc-support-reclaim': 0.5,
    'eth-range-fakeout': 0.34,
    'sol-breakout-ladder': 0.91,
  },
};

const roleFit: Record<OwnedAgent['role'], Record<EvalScenario['id'], number>> = {
  SCOUT: {
    'btc-support-reclaim': 0.76,
    'eth-range-fakeout': 0.71,
    'sol-breakout-ladder': 0.74,
  },
  ANALYST: {
    'btc-support-reclaim': 0.84,
    'eth-range-fakeout': 0.77,
    'sol-breakout-ladder': 0.66,
  },
  RISK: {
    'btc-support-reclaim': 0.79,
    'eth-range-fakeout': 0.95,
    'sol-breakout-ladder': 0.51,
  },
  EXECUTOR: {
    'btc-support-reclaim': 0.62,
    'eth-range-fakeout': 0.49,
    'sol-breakout-ladder': 0.98,
  },
};

function toPercent(score: number): number {
  return Math.round(score * 100);
}

function doctrineClarityScore(doctrineNote: string, scenario: EvalScenario): number {
  const normalized = doctrineNote.toLowerCase();
  const cueWords = [
    'support',
    'break',
    'retest',
    'wick',
    'structure',
    'hold',
    'trap',
    scenario.symbol.toLowerCase(),
  ];
  const matches = cueWords.filter((word) => normalized.includes(word)).length;
  const lengthBonus = Math.min(1, doctrineNote.trim().length / 120);
  return Math.min(1, matches * 0.11 + lengthBonus * 0.35);
}

function horizonFit(loadout: TrainingLoadout, scenario: EvalScenario): number {
  if (loadout.horizon === scenario.preferredHorizon) {
    return 1;
  }
  if (loadout.horizon === 'INTRADAY' || scenario.preferredHorizon === 'INTRADAY') {
    return 0.72;
  }
  return 0.45;
}

function riskFit(loadout: TrainingLoadout, scenario: EvalScenario): number {
  const distance = Math.abs(loadout.riskTolerance - scenario.idealRiskTolerance);
  return Math.max(0, 1 - distance / 50);
}

function scoreBlend(...scores: number[]): number {
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function humanize(id: string): string {
  return id.toLowerCase().replaceAll('_', ' ');
}

function instinctLabelForIndicator(indicatorPresetId: IndicatorPresetId): string {
  switch (indicatorPresetId) {
    case 'TREND_RIBBON':
      return 'Trend ribbon timing';
    case 'STRUCTURE_MAP':
      return 'Structure map read';
    case 'LIQUIDITY_LENS':
      return 'Liquidity lens scan';
  }
}

function instinctLabelForScript(scriptPresetId: ScriptPresetId): string {
  switch (scriptPresetId) {
    case 'BREAKOUT_CONFIRM':
      return 'Breakout confirm discipline';
    case 'SUPPORT_DEFEND':
      return 'Support defend discipline';
    case 'TRAP_FADE':
      return 'Trap fade discipline';
  }
}

function instinctLabelForMemory(memoryBias: MemoryBias): string {
  switch (memoryBias) {
    case 'FAILURES':
      return 'Failure recall';
    case 'PLAYBOOKS':
      return 'Playbook recall';
    case 'WINS':
      return 'Winning pattern recall';
  }
}

function instinctLabelForRisk(confidenceStyle: ConfidenceStyle): string {
  switch (confidenceStyle) {
    case 'CONSERVATIVE':
      return 'Risk brace';
    case 'BALANCED':
      return 'Risk poise';
    case 'AGGRESSIVE':
      return 'Commit nerve';
  }
}

function captainLabelForRole(role: OwnedAgent['role']): string {
  switch (role) {
    case 'SCOUT':
      return 'Lane scouting';
    case 'ANALYST':
      return 'Captain synthesis';
    case 'RISK':
      return 'Veto timing';
    case 'EXECUTOR':
      return 'Commit timing';
  }
}

function buildInstincts(
  agent: OwnedAgent,
  loadout: TrainingLoadout,
  scores: {
    indicator: number;
    script: number;
    memory: number;
    doctrine: number;
    risk: number;
    coordination: number;
  },
): AgentInstinct[] {
  const instincts = ([
    {
      id: `${agent.id}-indicator`,
      label: instinctLabelForIndicator(loadout.indicatorPresetId),
      gene: 'INDICATOR',
      weight: toPercent(scores.indicator),
      state: 'WATCH',
    },
    {
      id: `${agent.id}-script`,
      label: instinctLabelForScript(loadout.scriptPresetId),
      gene: 'SCRIPT',
      weight: toPercent(scores.script),
      state: 'WATCH',
    },
    {
      id: `${agent.id}-memory`,
      label: instinctLabelForMemory(loadout.memoryBias),
      gene: 'MEMORY',
      weight: toPercent(scores.memory),
      state: 'WATCH',
    },
    {
      id: `${agent.id}-doctrine`,
      label: 'Doctrine clarity',
      gene: 'DOCTRINE',
      weight: toPercent(scores.doctrine),
      state: 'WATCH',
    },
    {
      id: `${agent.id}-risk`,
      label: instinctLabelForRisk(loadout.confidenceStyle),
      gene: 'RISK',
      weight: toPercent(scores.risk),
      state: 'WATCH',
    },
    {
      id: `${agent.id}-coordination`,
      label: captainLabelForRole(agent.role),
      gene: 'COORDINATION',
      weight: toPercent(scores.coordination),
      state: 'WATCH',
    },
  ] satisfies AgentInstinct[]).sort((left, right) => right.weight - left.weight);

  return instincts.map((instinct, index) => ({
    ...instinct,
    state: index < 2 ? 'TRUSTED' : index === instincts.length - 1 ? 'WEAK' : 'WATCH',
  }));
}

function decisionForComparison(comparison: Pick<EvalComparison, 'deltas'>): MutationDecision {
  const negatives = Object.values(comparison.deltas).filter((value) => value < 0).length;
  if (comparison.deltas.totalScore >= 5 && negatives <= 2) {
    return 'ACCEPTED';
  }
  if (comparison.deltas.totalScore >= 0) {
    return 'QUARANTINED';
  }
  return 'REVERTED';
}

function effectForDecision(gene: MutationGene, decision: MutationDecision): string {
  if (decision === 'REVERTED') {
    switch (gene) {
      case 'DOCTRINE':
        return 'Doctrine crest dims and the body line loosens again.';
      case 'INDICATOR':
        return 'Scout lens retracts and the antenna line loses confidence.';
      case 'SCRIPT':
        return 'Execution scarf loosens and the stance drops back.';
      case 'MEMORY':
        return 'Archive sigil cools and the satchel is held back.';
      case 'RISK':
        return 'Guard shell softens and the feet stop planting cleanly.';
      case 'COORDINATION':
        return 'Captain halo flickers and squad spacing gets messy.';
    }
  }
  if (decision === 'QUARANTINED') {
    switch (gene) {
      case 'DOCTRINE':
        return 'Doctrine crest stays faint while the form remains under review.';
      case 'INDICATOR':
        return 'Scout lens stays provisional until another proof confirms it.';
      case 'SCRIPT':
        return 'Execution scarf is fitted, but still withheld from full promotion.';
      case 'MEMORY':
        return 'Archive sigil is packed away until the replay is cleaner.';
      case 'RISK':
        return 'Guard shell is fitted for sparring only, not trusted field use.';
      case 'COORDINATION':
        return 'Captain halo remains dim until the squad sync survives another frame.';
    }
  }

  switch (gene) {
    case 'DOCTRINE':
      return 'Doctrine crest brightens and the body line steadies.';
    case 'INDICATOR':
      return 'Scout lens sharpens and the antenna line reads cleaner.';
    case 'SCRIPT':
      return 'Execution scarf tightens into a more disciplined stance.';
    case 'MEMORY':
      return 'Archive sigil glows and the keepsake satchel fills out.';
    case 'RISK':
      return 'Guard shell thickens and the feet plant lower on the chart.';
    case 'COORDINATION':
      return 'Captain halo and squad spacing become more deliberate.';
  }
}

function titleForGene(gene: MutationGene): string {
  switch (gene) {
    case 'DOCTRINE':
      return 'Doctrine Rewrite';
    case 'INDICATOR':
      return 'Indicator Retune';
    case 'SCRIPT':
      return 'Script Rewrite';
    case 'MEMORY':
      return 'Memory Reindex';
    case 'RISK':
      return 'Risk Brace Retune';
    case 'COORDINATION':
      return 'Captain Timing Retune';
  }
}

function reasonForDecision(comparison: EvalComparison, gene: MutationGene): string {
  const topImprovement = Object.entries(comparison.deltas).sort((left, right) => right[1] - left[1])[0];
  const topRegression = Object.entries(comparison.deltas).sort((left, right) => left[1] - right[1])[0];

  if (comparison.decision === 'ACCEPTED') {
    return `${titleForGene(gene)} survived because ${topImprovement[0].replace('Score', '')} improved by ${topImprovement[1]}.`;
  }
  if (comparison.decision === 'QUARANTINED') {
    return `${titleForGene(gene)} stays unpromoted because the gain was noisy while ${topRegression[0].replace('Score', '')} stayed fragile.`;
  }
  return `${titleForGene(gene)} was reverted because ${topRegression[0].replace('Score', '')} dropped by ${Math.abs(topRegression[1])}.`;
}

function summaryForDecision(comparison: EvalComparison, decision: MutationDecision): string {
  if (decision === 'ACCEPTED') {
    return `Projected +${comparison.deltas.totalScore} total in ${comparison.scenario.label}; this mutation is being kept into the next proof pack.`;
  }
  if (decision === 'QUARANTINED') {
    return `Projected +${comparison.deltas.totalScore} total in ${comparison.scenario.label}; the mutation stays bench-side until another proof confirms it.`;
  }
  return `Projected ${comparison.deltas.totalScore} total in ${comparison.scenario.label}; this mutation is being reverted out of the active body.`;
}

function findScenario(scenarioId: string): EvalScenario {
  const scenario = evalScenarios.find((entry) => entry.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  return scenario;
}

export function evaluateAgentLoadout(agent: OwnedAgent, loadout: TrainingLoadout, scenarioId: string): EvalReport {
  const scenario = findScenario(scenarioId);
  const indicator = indicatorFit[loadout.indicatorPresetId][scenario.id];
  const script = scriptFit[loadout.scriptPresetId][scenario.id];
  const memory = memoryFit[loadout.memoryBias][scenario.id];
  const confidence = confidenceFit[loadout.confidenceStyle][scenario.id];
  const role = roleFit[agent.role][scenario.id];
  const risk = riskFit(loadout, scenario);
  const doctrine = doctrineClarityScore(loadout.doctrineNote, scenario);
  const horizon = horizonFit(loadout, scenario);

  const accuracyScore = toPercent(scoreBlend(indicator, script, role, horizon));
  const reasoningScore = toPercent(scoreBlend(doctrine, memory, confidence));
  const riskScore = toPercent(scoreBlend(risk, confidence, memory));
  const coordinationScore = toPercent(scoreBlend(role, script, doctrine));
  const calibrationScore = toPercent(scoreBlend(risk, confidence, horizon));
  const retrievalScore = toPercent(scoreBlend(memory, doctrine, indicator));
  const instincts = buildInstincts(agent, loadout, {
    indicator,
    script,
    memory,
    doctrine,
    risk: scoreBlend(risk, confidence),
    coordination: scoreBlend(role, script, doctrine),
  });
  const weakLink = instincts[instincts.length - 1];
  const referenceFrame = getReferenceProofFrame(scenario.id);
  const totalScore = Math.round(
    accuracyScore * 0.24 +
      reasoningScore * 0.18 +
      riskScore * 0.18 +
      coordinationScore * 0.16 +
      calibrationScore * 0.12 +
      retrievalScore * 0.12,
  );

  return {
    scenarioId,
    action: scenario.targetAction,
    confidence: Math.round(scoreBlend(confidence, doctrine, risk) * 100),
    accuracyScore,
    reasoningScore,
    riskScore,
    coordinationScore,
    calibrationScore,
    retrievalScore,
    totalScore,
    battleRead: `${agent.name} now reads ${scenario.terrain.toLowerCase()} as a ${scenario.targetAction.toLowerCase()} setup with ${humanize(loadout.scriptPresetId)} discipline and ${instincts[0]?.label.toLowerCase()} leading the call.`,
    retrievalRead: `${instinctLabelForMemory(loadout.memoryBias)} and the doctrine note "${loadout.doctrineNote}" are shaping how the agent explains ${scenario.structureHint.toLowerCase()} against ${referenceFrame.title}.`,
    trustedInstincts: instincts,
    weakLink: weakLink?.label ?? 'Unknown weak link',
    weakLinkGene: weakLink?.gene ?? 'DOCTRINE',
    captainCall: `${captainLabelForRole(agent.role)} favors ${scenario.targetAction.toLowerCase()} because ${instincts[0]?.label.toLowerCase()} outranked ${weakLink?.label.toLowerCase()}.`,
    objection: `${weakLink?.label ?? 'Weak link'} is still the loudest objection and can still break the read if it is ignored.`,
    proofFrameId: referenceFrame.id,
    proofFrameTitle: referenceFrame.title,
    proofFrameDateLabel: referenceFrame.dateLabel,
  };
}

function delta(current: number, proposed: number): number {
  return proposed - current;
}

export function compareLoadouts(agent: OwnedAgent, currentLoadout: TrainingLoadout, proposedLoadout: TrainingLoadout, scenarioId: string): EvalComparison {
  const scenario = findScenario(scenarioId);
  const current = evaluateAgentLoadout(agent, currentLoadout, scenarioId);
  const proposed = evaluateAgentLoadout(agent, proposedLoadout, scenarioId);
  const deltas = {
    totalScore: delta(current.totalScore, proposed.totalScore),
    accuracyScore: delta(current.accuracyScore, proposed.accuracyScore),
    reasoningScore: delta(current.reasoningScore, proposed.reasoningScore),
    riskScore: delta(current.riskScore, proposed.riskScore),
    coordinationScore: delta(current.coordinationScore, proposed.coordinationScore),
    calibrationScore: delta(current.calibrationScore, proposed.calibrationScore),
    retrievalScore: delta(current.retrievalScore, proposed.retrievalScore),
  };

  const decision = decisionForComparison({ deltas } as Pick<EvalComparison, 'deltas'>);
  const summary = summaryForDecision(
    {
      scenario,
      current,
      proposed,
      deltas,
      decision,
      decisionReason: '',
      visibleEffect: '',
      summary: '',
    },
    decision,
  );

  return {
    scenario,
    current,
    proposed,
    deltas,
    decision,
    decisionReason: reasonForDecision(
      {
        scenario,
        current,
        proposed,
        deltas,
        decision,
        decisionReason: '',
        visibleEffect: '',
        summary,
      },
      proposed.weakLinkGene,
    ),
    visibleEffect: effectForDecision(proposed.weakLinkGene, decision),
    summary,
  };
}

export function overrideComparisonDecision(comparison: EvalComparison, decision: MutationDecision): EvalComparison {
  const next = {
    ...comparison,
    decision,
  };
  return {
    ...next,
    summary: summaryForDecision(next, decision),
    decisionReason: reasonForDecision(next, comparison.proposed.weakLinkGene),
    visibleEffect: effectForDecision(comparison.proposed.weakLinkGene, decision),
  };
}

export function buildMutationRecord(agentId: string, comparison: EvalComparison): AgentMutation {
  return {
    id: `${agentId}-${Date.now()}`,
    title: titleForGene(comparison.proposed.weakLinkGene),
    gene: comparison.proposed.weakLinkGene,
    decision: comparison.decision,
    reason: comparison.decisionReason,
    proofFrameId: comparison.proposed.proofFrameId,
    proofFrameTitle: comparison.proposed.proofFrameTitle,
    visibleEffect: comparison.visibleEffect,
    deltaTotal: comparison.deltas.totalScore,
    createdAt: Date.now(),
  };
}
