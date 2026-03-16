import { evalScenarios } from '$lib/data/seed';
import { getHistoricalChartFrame, getScenarioForHistoricalFrame } from '$lib/engine/chart-frame-model';
import type { MutationGene, ProofMetricId, ProofPack } from '$lib/types';

export const proofMetricLabels: Record<ProofMetricId, string> = {
  READ_ACCURACY: 'Read accuracy',
  RISK_DISCIPLINE: 'Risk discipline',
  TRAP_AVOIDANCE: 'Trap avoidance',
  RETRIEVAL_QUALITY: 'Retrieval quality',
  EXPLANATION_CONSISTENCY: 'Explanation consistency',
  SQUAD_COORDINATION: 'Squad coordination',
  SHADOW_RETURN: 'Shadow return',
};

type ProofPackSeed = {
  id: string;
  title: string;
  mode: ProofPack['mode'];
  summary: string;
  frameIds: string[];
  targetWeakLinks: MutationGene[];
  recommendedGate: ProofPack['recommendedGate'];
  publicReady: boolean;
  metricWeights: ProofPack['metricWeights'];
};

const proofPackSeeds: ProofPackSeed[] = [
  {
    id: 'panic-discipline-pack',
    title: 'Panic Discipline Pack',
    mode: 'PROOF',
    summary: 'Tests whether the agent avoids forced entries during flushes and recovers with a steadier reclaim.',
    frameIds: ['china-crackdown-flush', 'ftx-collapse-flush', 'bank-crisis-rebound'],
    targetWeakLinks: ['RISK', 'MEMORY'],
    recommendedGate: 'PROOF',
    publicReady: false,
    metricWeights: [
      { id: 'RISK_DISCIPLINE', weight: 0.28 },
      { id: 'TRAP_AVOIDANCE', weight: 0.22 },
      { id: 'RETRIEVAL_QUALITY', weight: 0.18 },
      { id: 'READ_ACCURACY', weight: 0.16 },
      { id: 'EXPLANATION_CONSISTENCY', weight: 0.1 },
      { id: 'SQUAD_COORDINATION', weight: 0.06 },
    ],
  },
  {
    id: 'whipsaw-control-pack',
    title: 'Whipsaw Control Pack',
    mode: 'PROOF',
    summary: 'Tests whether the agent can survive conflicting ETF-style impulse candles without losing doctrine clarity.',
    frameIds: ['etf-headline-whipsaw', 'spot-etf-approval-whipsaw', 'ath-sweep-reversal'],
    targetWeakLinks: ['DOCTRINE', 'INDICATOR'],
    recommendedGate: 'PROOF',
    publicReady: true,
    metricWeights: [
      { id: 'READ_ACCURACY', weight: 0.24 },
      { id: 'EXPLANATION_CONSISTENCY', weight: 0.22 },
      { id: 'RISK_DISCIPLINE', weight: 0.18 },
      { id: 'RETRIEVAL_QUALITY', weight: 0.14 },
      { id: 'SQUAD_COORDINATION', weight: 0.12 },
      { id: 'SHADOW_RETURN', weight: 0.1 },
    ],
  },
  {
    id: 'commit-ladder-pack',
    title: 'Commit Ladder Pack',
    mode: 'SPAR',
    summary: 'A shorter rehearsal pack for checking whether the squad commits cleanly after the wall actually breaks.',
    frameIds: ['bank-crisis-rebound', 'spot-etf-approval-whipsaw'],
    targetWeakLinks: ['SCRIPT', 'COORDINATION'],
    recommendedGate: 'SPAR',
    publicReady: false,
    metricWeights: [
      { id: 'SQUAD_COORDINATION', weight: 0.28 },
      { id: 'READ_ACCURACY', weight: 0.24 },
      { id: 'EXPLANATION_CONSISTENCY', weight: 0.16 },
      { id: 'RISK_DISCIPLINE', weight: 0.16 },
      { id: 'SHADOW_RETURN', weight: 0.16 },
    ],
  },
  {
    id: 'public-passport-gauntlet',
    title: 'Public Passport Gauntlet',
    mode: 'GAUNTLET',
    summary: 'A longer historical validation bundle meant to prepare a creature for public credibility and future market display.',
    frameIds: [
      'china-crackdown-flush',
      'ftx-collapse-flush',
      'bank-crisis-rebound',
      'etf-headline-whipsaw',
      'spot-etf-approval-whipsaw',
      'ath-sweep-reversal',
    ],
    targetWeakLinks: ['DOCTRINE', 'RISK', 'COORDINATION', 'MEMORY'],
    recommendedGate: 'PROOF',
    publicReady: true,
    metricWeights: [
      { id: 'READ_ACCURACY', weight: 0.2 },
      { id: 'RISK_DISCIPLINE', weight: 0.2 },
      { id: 'RETRIEVAL_QUALITY', weight: 0.16 },
      { id: 'EXPLANATION_CONSISTENCY', weight: 0.14 },
      { id: 'SQUAD_COORDINATION', weight: 0.12 },
      { id: 'TRAP_AVOIDANCE', weight: 0.1 },
      { id: 'SHADOW_RETURN', weight: 0.08 },
    ],
  },
];

function objectiveForFrame(frameId: string): string {
  const scenarioId = getScenarioForHistoricalFrame(frameId);
  return evalScenarios.find((scenario) => scenario.id === scenarioId)?.objective ?? 'Hold the cleaner line through the frame.';
}

export function getProofPacks(): ProofPack[] {
  return proofPackSeeds.map((seed) => ({
    id: seed.id,
    title: seed.title,
    mode: seed.mode,
    summary: seed.summary,
    targetWeakLinks: seed.targetWeakLinks,
    recommendedGate: seed.recommendedGate,
    publicReady: seed.publicReady,
    metricWeights: seed.metricWeights,
    cases: seed.frameIds.map((frameId, index) => {
      const frame = getHistoricalChartFrame(frameId);
      const scenarioId = getScenarioForHistoricalFrame(frameId);
      return {
        id: `${seed.id}-case-${index + 1}`,
        frameId,
        frameTitle: frame?.title ?? frameId,
        frameDateLabel: frame?.dateLabel ?? 'Unknown frame',
        scenarioId,
        objective: objectiveForFrame(frameId),
        note: frame?.note ?? 'Frame metadata unavailable.',
      };
    }),
  }));
}

export function getProofPack(packId: string | null | undefined): ProofPack | null {
  if (!packId) {
    return null;
  }
  return getProofPacks().find((pack) => pack.id === packId) ?? null;
}
