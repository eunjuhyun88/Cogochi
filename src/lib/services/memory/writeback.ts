import { getHistoricalChartFrame } from '$lib/engine/chart-frame-model';
import {
  buildMutationRecord,
  compareLoadouts,
  evaluateAgentLoadout,
  overrideComparisonDecision,
} from '$lib/engine/eval-engine';
import type {
  AgentInstinct,
  AgentMemoryCard,
  AgentMutation,
  CareState,
  EvalComparison,
  GrowthStage,
  MemoryTier,
  MutationDecision,
  MutationGene,
  OwnedAgent,
  ProvenFrame,
  TrainingLoadout,
  TrainingRun,
} from '$lib/types';

const growthOrder: GrowthStage[] = ['FRESH', 'TUNED', 'SPECIALIZED', 'SIGNATURE'];

function buildTrainingEventId(agentId: string): string {
  return `${agentId}-${Date.now()}`;
}

function advanceGrowthStage(currentStage: GrowthStage, deltaTotal: number): GrowthStage {
  if (deltaTotal <= 0) {
    return currentStage;
  }

  const currentIndex = growthOrder.indexOf(currentStage);
  const nextIndex = Math.min(currentIndex + 1, growthOrder.length - 1);
  return growthOrder[nextIndex] ?? currentStage;
}

function clampTrustWeight(value: number): number {
  return Math.max(20, Math.min(99, value));
}

export function keepsakeLabelForGene(gene: MutationGene): string {
  if (gene === 'DOCTRINE') {
    return 'Doctrine crest';
  }
  if (gene === 'MEMORY') {
    return 'Archive sigil';
  }
  if (gene === 'RISK') {
    return 'Guard shell';
  }
  if (gene === 'COORDINATION') {
    return 'Captain halo';
  }
  if (gene === 'SCRIPT') {
    return 'Execution scarf';
  }
  return 'Scout lens';
}

function buildKeepsakeLabel(decision: MutationDecision, deltaTotal: number, gene: MutationGene): string | null {
  if (decision !== 'ACCEPTED' || deltaTotal < 6) {
    return null;
  }
  return keepsakeLabelForGene(gene);
}

function deriveCareState(comparison: EvalComparison): CareState {
  if (comparison.decision === 'ACCEPTED') {
    return 'CLEAR';
  }
  if (comparison.deltas.retrievalScore < 0) {
    return 'MEMORY_DRIFT';
  }
  if (comparison.deltas.reasoningScore < 0) {
    return 'DOCTRINE_BLUR';
  }
  if (comparison.deltas.coordinationScore < 0) {
    return 'SQUAD_FRICTION';
  }
  return 'CONFIDENCE_SHAKE';
}

function deriveNextCareAction(
  comparison: EvalComparison,
  nextStage: GrowthStage,
  careState: CareState,
  decision: MutationDecision,
): string {
  if (decision === 'ACCEPTED') {
    return `Lock the ${nextStage.toLowerCase()} form with one more proof on ${comparison.proposed.proofFrameTitle}.`;
  }
  if (decision === 'QUARANTINED') {
    return `Quarantine the mutation, then spar ${comparison.proposed.proofFrameTitle} again before promotion.`;
  }

  switch (careState) {
    case 'MEMORY_DRIFT':
      return `Curate memory before rerunning ${comparison.scenario.label}.`;
    case 'DOCTRINE_BLUR':
      return `Rewrite the doctrine note so ${comparison.scenario.structureHint.toLowerCase()} becomes a crisp rule.`;
    case 'SQUAD_FRICTION':
      return `Restabilize role fit before the next ${comparison.scenario.targetAction.toLowerCase()} test.`;
    case 'CONFIDENCE_SHAKE':
      return 'Run a safer spar to rebuild commitment timing before the next live battle.';
    default:
      return 'Keep sharpening the current form with one more controlled rerun.';
  }
}

function adjustTrustWeight(currentWeight: number, decision: MutationDecision): number {
  if (decision === 'ACCEPTED') {
    return clampTrustWeight(currentWeight + 4);
  }
  if (decision === 'QUARANTINED') {
    return clampTrustWeight(currentWeight - 1);
  }
  return clampTrustWeight(currentWeight - 5);
}

function mergeTrustedInstincts(currentInstincts: AgentInstinct[], comparison: EvalComparison): AgentInstinct[] {
  if (comparison.decision === 'ACCEPTED') {
    return comparison.proposed.trustedInstincts;
  }

  return currentInstincts.map((instinct) =>
    instinct.gene === comparison.proposed.weakLinkGene
      ? {
          ...instinct,
          weight: Math.max(18, instinct.weight - (comparison.decision === 'REVERTED' ? 8 : 3)),
          state: 'WEAK',
        }
      : instinct,
  );
}

function buildProvenFrameWriteback(currentFrames: ProvenFrame[], comparison: EvalComparison): ProvenFrame[] {
  const result =
    comparison.decision === 'ACCEPTED'
      ? 'PASSED'
      : comparison.decision === 'REVERTED'
        ? 'FAILED'
        : 'UNSTABLE';

  const nextFrame: ProvenFrame = {
    id: comparison.proposed.proofFrameId,
    title: comparison.proposed.proofFrameTitle,
    dateLabel: comparison.proposed.proofFrameDateLabel,
    note: comparison.decisionReason,
    result,
  };

  const filtered = currentFrames.filter((frame) => frame.id !== nextFrame.id);
  return [nextFrame, ...filtered].slice(0, 4);
}

function buildBattleProvenFrameWriteback(
  currentFrames: ProvenFrame[],
  frameId: string | null,
  fallbackFrameId: string,
  decision: MutationDecision,
  note: string,
): ProvenFrame[] {
  const frame = getHistoricalChartFrame(frameId ?? fallbackFrameId) ?? getHistoricalChartFrame(fallbackFrameId);
  const nextFrame: ProvenFrame = {
    id: frame?.id ?? fallbackFrameId,
    title: frame?.title ?? fallbackFrameId,
    dateLabel: frame?.dateLabel ?? 'Unknown frame',
    note,
    result: decision === 'ACCEPTED' ? 'PASSED' : decision === 'REVERTED' ? 'FAILED' : 'UNSTABLE',
  };
  const filtered = currentFrames.filter((entry) => entry.id !== nextFrame.id);
  return [nextFrame, ...filtered].slice(0, 4);
}

function mergeBattleTrustedInstincts(
  currentInstincts: AgentInstinct[],
  battleInstincts: AgentInstinct[],
  weakGene: MutationGene,
  decision: MutationDecision,
): AgentInstinct[] {
  if (decision === 'ACCEPTED') {
    return battleInstincts;
  }
  return currentInstincts.map((instinct) =>
    instinct.gene === weakGene
      ? {
          ...instinct,
          weight: Math.max(18, instinct.weight - (decision === 'REVERTED' ? 8 : 3)),
          state: 'WEAK',
        }
      : instinct,
  );
}

function deriveBattleCareState(weakGene: MutationGene, decision: MutationDecision): CareState {
  if (decision === 'ACCEPTED') {
    return 'CLEAR';
  }
  if (weakGene === 'MEMORY') {
    return 'MEMORY_DRIFT';
  }
  if (weakGene === 'DOCTRINE') {
    return 'DOCTRINE_BLUR';
  }
  if (weakGene === 'COORDINATION') {
    return 'SQUAD_FRICTION';
  }
  return 'CONFIDENCE_SHAKE';
}

function buildBattleMutationRecord(
  agentId: string,
  proofFrameId: string | null,
  proofFrameTitle: string,
  weakGene: MutationGene,
  decision: MutationDecision,
  reason: string,
  visibleEffect: string,
  deltaTotal: number,
): AgentMutation {
  return {
    id: `${agentId}-${Date.now()}`,
    title:
      decision === 'ACCEPTED'
        ? 'Field proof survived'
        : decision === 'REVERTED'
          ? 'Field proof failed'
          : 'Field proof unstable',
    gene: weakGene,
    decision,
    reason,
    proofFrameId: proofFrameId ?? 'field-proof',
    proofFrameTitle,
    visibleEffect,
    deltaTotal,
    createdAt: Date.now(),
  };
}

function deriveBattleNextCareAction(
  decision: MutationDecision,
  frameTitle: string,
  careState: CareState,
  weakLink: string,
): string {
  if (decision === 'ACCEPTED') {
    return `Carry this form back to the field and prove it again on ${frameTitle}.`;
  }
  if (decision === 'QUARANTINED') {
    return `Rest the squad, then rerun ${frameTitle} before trusting the new form.`;
  }
  switch (careState) {
    case 'MEMORY_DRIFT':
      return `Repair memory discipline before challenging ${frameTitle} again.`;
    case 'DOCTRINE_BLUR':
      return `Rewrite the doctrine around ${weakLink.toLowerCase()} before the next field proof.`;
    case 'SQUAD_FRICTION':
      return `Rebalance squad timing before you reopen ${frameTitle}.`;
    default:
      return `Spar a safer frame before you trust this body in ${frameTitle} again.`;
  }
}

function memoryKindForTrainingDecision(decision: MutationDecision): AgentMemoryCard['type'] {
  if (decision === 'ACCEPTED') {
    return 'PLAYBOOK';
  }
  if (decision === 'QUARANTINED') {
    return 'USER_NOTE';
  }
  return 'FAILURE_CASE';
}

function memoryKindForBattleDecision(decision: MutationDecision, outcome: 'WIN' | 'LOSS'): AgentMemoryCard['type'] {
  if (decision === 'ACCEPTED' && outcome === 'WIN') {
    return 'SUCCESS_CASE';
  }
  if (decision === 'ACCEPTED') {
    return 'PLAYBOOK';
  }
  if (decision === 'QUARANTINED') {
    return 'USER_NOTE';
  }
  return 'FAILURE_CASE';
}

function memoryTierForDecision(decision: MutationDecision, acceptedTier: MemoryTier = 'M90'): MemoryTier {
  if (decision === 'ACCEPTED') {
    return acceptedTier;
  }
  if (decision === 'QUARANTINED') {
    return 'M30';
  }
  return 'M30';
}

function mergeMemoryBank(currentMemoryBank: AgentMemoryCard[], nextMemory: AgentMemoryCard): AgentMemoryCard[] {
  const filtered = currentMemoryBank.filter((memory) => memory.id !== nextMemory.id && memory.title !== nextMemory.title);
  return [nextMemory, ...filtered].slice(0, 10);
}

function buildTrainingMemoryCard(agentId: string, comparison: EvalComparison, mutation: AgentMutation): AgentMemoryCard {
  return {
    id: `${agentId}-training-memory-${Date.now()}`,
    type: memoryKindForTrainingDecision(comparison.decision),
    title: `${comparison.scenario.label} / ${mutation.title}`,
    note: `${comparison.summary} ${comparison.decisionReason}`,
    tier: memoryTierForDecision(comparison.decision, 'M90'),
    source: 'TRAINING',
    createdAt: Date.now(),
  };
}

function buildBattleMemoryCard(
  agentId: string,
  mutation: AgentMutation,
  outcome: 'WIN' | 'LOSS',
  reason: string,
): AgentMemoryCard {
  return {
    id: `${agentId}-battle-memory-${Date.now()}`,
    type: memoryKindForBattleDecision(mutation.decision, outcome),
    title: `${mutation.proofFrameTitle} / ${mutation.title}`,
    note: reason,
    tier: memoryTierForDecision(mutation.decision, outcome === 'WIN' ? 'M365' : 'M90'),
    source: 'BATTLE',
    createdAt: Date.now(),
  };
}

function buildTrainingRun(agentId: string, scenarioId: string, summary: string, deltaTotal: number): TrainingRun {
  return {
    id: buildTrainingEventId(agentId),
    agentId,
    scenarioId,
    createdAt: Date.now(),
    summary,
    deltaTotal,
  };
}

export function buildTrainingWriteback(
  agent: OwnedAgent,
  nextLoadout: TrainingLoadout,
  scenarioId: string,
  decisionOverride?: MutationDecision,
): { comparison: EvalComparison; nextAgent: OwnedAgent } {
  const comparison = compareLoadouts(agent, agent.loadout, nextLoadout, scenarioId);
  const resolvedComparison = decisionOverride ? overrideComparisonDecision(comparison, decisionOverride) : comparison;
  const mutation = buildMutationRecord(agent.id, resolvedComparison);
  const accepted = resolvedComparison.decision === 'ACCEPTED';
  const nextStage = accepted ? advanceGrowthStage(agent.growthStage, resolvedComparison.deltas.totalScore) : agent.growthStage;
  const careState = deriveCareState(resolvedComparison);
  const keepsake = buildKeepsakeLabel(
    resolvedComparison.decision,
    resolvedComparison.deltas.totalScore,
    resolvedComparison.proposed.weakLinkGene,
  );
  const summary = `${resolvedComparison.summary} ${resolvedComparison.decisionReason}`;
  const memoryCard = buildTrainingMemoryCard(agent.id, resolvedComparison, mutation);

  return {
    comparison: resolvedComparison,
    nextAgent: {
      ...agent,
      loadout: accepted ? nextLoadout : agent.loadout,
      trustWeight: adjustTrustWeight(agent.trustWeight, resolvedComparison.decision),
      growthStage: nextStage,
      keepsakes:
        keepsake && !agent.keepsakes.includes(keepsake)
          ? [keepsake, ...agent.keepsakes].slice(0, 4)
          : agent.keepsakes,
      careState,
      nextCareAction: deriveNextCareAction(resolvedComparison, nextStage, careState, resolvedComparison.decision),
      recentLesson: summary,
      recentTrainingFocus: `${mutation.title} / ${resolvedComparison.decision.toLowerCase()}`,
      trustedInstincts: mergeTrustedInstincts(agent.trustedInstincts, resolvedComparison),
      weakLink: resolvedComparison.proposed.weakLink,
      provenFrames: buildProvenFrameWriteback(agent.provenFrames, resolvedComparison),
      mutations: [mutation, ...agent.mutations].slice(0, 8),
      status: 'READY',
      lastComparison: resolvedComparison,
      memoryBank: mergeMemoryBank(agent.memoryBank, memoryCard),
      trainingHistory: [buildTrainingRun(agent.id, scenarioId, summary, resolvedComparison.deltas.totalScore), ...agent.trainingHistory].slice(0, 6),
    },
  };
}

export function buildBattleWriteback(
  agent: OwnedAgent,
  scenarioId: string,
  outcome: 'WIN' | 'LOSS',
  entryFrameId: string | null,
  decisionOverride?: MutationDecision,
  doctrineSessionTitle?: string | null,
): { mutation: AgentMutation; nextAgent: OwnedAgent } {
  const report = evaluateAgentLoadout(agent, agent.loadout, scenarioId);
  const decision: MutationDecision = decisionOverride ?? (outcome === 'WIN' ? 'ACCEPTED' : 'REVERTED');
  const frame = getHistoricalChartFrame(entryFrameId ?? report.proofFrameId) ?? null;
  const frameTitle = frame?.title ?? report.proofFrameTitle;
  const deltaTotal =
    outcome === 'WIN'
      ? Math.max(4, Math.round((report.totalScore - 56) / 3))
      : -Math.max(4, Math.round((72 - report.totalScore) / 3));
  const reason =
    decision === 'ACCEPTED'
      ? `${frameTitle} is being kept as a surviving field proof.${doctrineSessionTitle ? ` ${doctrineSessionTitle} survived the clash.` : ''} ${report.captainCall} The trainer chose to keep the mutation despite a ${outcome.toLowerCase()} result.`
      : decision === 'QUARANTINED'
        ? `${frameTitle} stays in review.${doctrineSessionTitle ? ` ${doctrineSessionTitle} remains under review.` : ''} ${report.weakLink} remains the live objection, so the trainer quarantined the result after a ${outcome.toLowerCase()} field run.`
        : `${frameTitle} is being reverted out of the active body.${doctrineSessionTitle ? ` ${doctrineSessionTitle} did not hold up in the clash.` : ''} ${report.weakLink} stayed too dangerous after the ${outcome.toLowerCase()} field run.`;
  const visibleEffect =
    decision === 'ACCEPTED'
      ? `${keepsakeLabelForGene(report.weakLinkGene)} stays attached and the stance reads steadier on the chart.`
      : decision === 'QUARANTINED'
        ? `${keepsakeLabelForGene(report.weakLinkGene)} stays provisional while the body remains under review.`
        : `${report.weakLink} shows strain and the body falls back into a shakier field posture.`;
  const mutation = buildBattleMutationRecord(
    agent.id,
    frame?.id ?? entryFrameId,
    frameTitle,
    report.weakLinkGene,
    decision,
    reason,
    visibleEffect,
    deltaTotal,
  );
  const careState = deriveBattleCareState(report.weakLinkGene, decision);
  const nextStage = decision === 'ACCEPTED' ? advanceGrowthStage(agent.growthStage, Math.max(1, deltaTotal)) : agent.growthStage;
  const keepsake = buildKeepsakeLabel(decision, Math.abs(deltaTotal) + 2, report.weakLinkGene);
  const memoryCard = buildBattleMemoryCard(agent.id, mutation, outcome, reason);

  return {
    mutation,
    nextAgent: {
      ...agent,
      trustWeight: adjustTrustWeight(agent.trustWeight, decision),
      growthStage: nextStage,
      keepsakes:
        keepsake && !agent.keepsakes.includes(keepsake)
          ? [keepsake, ...agent.keepsakes].slice(0, 4)
          : agent.keepsakes,
      careState,
      nextCareAction: deriveBattleNextCareAction(decision, frameTitle, careState, report.weakLink),
      recentLesson: reason,
      recentTrainingFocus: doctrineSessionTitle ? `${doctrineSessionTitle} / ${decision.toLowerCase()}` : `${frameTitle} / ${decision.toLowerCase()}`,
      trustedInstincts: mergeBattleTrustedInstincts(agent.trustedInstincts, report.trustedInstincts, report.weakLinkGene, decision),
      weakLink: report.weakLink,
      provenFrames: buildBattleProvenFrameWriteback(agent.provenFrames, frame?.id ?? entryFrameId, report.proofFrameId, decision, reason),
      mutations: [mutation, ...agent.mutations].slice(0, 8),
      status: 'READY',
      lastComparison: agent.lastComparison,
      memoryBank: mergeMemoryBank(agent.memoryBank, memoryCard),
      trainingHistory: [buildTrainingRun(agent.id, scenarioId, reason, deltaTotal), ...agent.trainingHistory].slice(0, 6),
    },
  };
}

export function buildMemoryTierSummary(memoryBank: AgentMemoryCard[]): Record<MemoryTier, number> {
  return memoryBank.reduce<Record<MemoryTier, number>>(
    (summary, memory) => {
      const tier = memory.tier ?? 'M30';
      summary[tier] += 1;
      return summary;
    },
    {
      M0: 0,
      M30: 0,
      M90: 0,
      M365: 0,
    },
  );
}
