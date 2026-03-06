import { get } from 'svelte/store';
import { createEvalScenario } from '../data/evalScenarios';
import { comparePromotionCandidates } from './evalService';
import { labStore } from '../stores/labStore';
import { matchStore } from '../stores/matchStore';
import { updateAgentConfiguration } from '../stores/rosterStore';
import type {
  EvalMatchResult,
  EvalMetrics,
  FineTuneArtifactManifest,
  FineTuneJobPayload,
  ModelArtifact,
  PromotionCandidateComparison,
  TrainingDatasetBundle
} from '../types';

function scenarioIdFromBenchmarkPack(benchmarkPackId: string): string {
  return benchmarkPackId.replace(/^benchmark-/, '') || 'btc-breakout';
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function defaultMetrics(benchmarkPackId: string): EvalMetrics {
  return withScenarioWeightedTotal(
    {
      returnScore: 0.5,
      riskScore: 0.5,
      accuracyScore: 0.5,
      calibrationScore: 0.5,
      reasoningScore: 0.5,
      coordinationScore: 0.5,
      totalScore: 0.5
    },
    benchmarkPackId
  );
}

function withScenarioWeightedTotal(metrics: EvalMetrics, benchmarkPackId: string): EvalMetrics {
  const scenario = createEvalScenario(scenarioIdFromBenchmarkPack(benchmarkPackId));
  const weights = scenario.scoringWeights;
  const totalScore =
    metrics.returnScore * weights.returnWeight +
    metrics.riskScore * weights.riskWeight +
    metrics.accuracyScore * weights.accuracyWeight +
    metrics.calibrationScore * weights.calibrationWeight +
    metrics.reasoningScore * weights.reasoningWeight +
    metrics.coordinationScore * weights.coordinationWeight;

  return {
    ...metrics,
    totalScore: Number(Math.min(1, Math.max(0, totalScore)).toFixed(2))
  };
}

function filterExamplesForAgent(bundle: TrainingDatasetBundle, agentId: string) {
  return {
    sftExamples: bundle.sftExamples.filter((example) => example.agentId === agentId),
    preferenceExamples: bundle.preferenceExamples.filter((example) => example.agentId === agentId)
  };
}

function collectExamplesByIds<T extends { id: string }>(examples: T[], ids: string[]): T[] {
  const wanted = new Set(ids);
  return examples.filter((example) => wanted.has(example.id));
}

function estimateArtifactMetrics(payload: FineTuneJobPayload): EvalMetrics {
  const trainQuality = average(payload.trainSftExamples.map((example) => example.qualityScore));
  const validQuality = average(payload.validSftExamples.map((example) => example.qualityScore));
  const preferenceQuality = average(payload.preferenceExamples.map((example) => example.qualityScore));
  const coverage = Math.min(
    1,
    (payload.trainSftExamples.length + payload.validSftExamples.length + payload.preferenceExamples.length) / 48
  );
  const kindBias = payload.kind === 'LORA' ? 0.05 : 0.03;

  return withScenarioWeightedTotal(
    {
      returnScore: Number((0.5 + coverage * 0.08 + kindBias * 0.4).toFixed(2)),
      riskScore: Number((0.52 + validQuality * 0.12 + preferenceQuality * 0.08).toFixed(2)),
      accuracyScore: Number((0.48 + trainQuality * 0.22 + coverage * 0.08).toFixed(2)),
      calibrationScore: Number((0.5 + validQuality * 0.16).toFixed(2)),
      reasoningScore: Number((0.5 + trainQuality * 0.18 + preferenceQuality * 0.06).toFixed(2)),
      coordinationScore: Number((0.5 + coverage * 0.1 + kindBias * 0.2).toFixed(2)),
      totalScore: 0.5
    },
    payload.benchmarkPackId
  );
}

function buildManifest(payload: FineTuneJobPayload, kind: 'SFT' | 'LORA'): FineTuneArtifactManifest {
  const createdAt = Date.now();
  const artifactId = `artifact-${kind.toLowerCase()}-${payload.agentId}-${createdAt}`;
  return {
    artifactId,
    agentId: payload.agentId,
    baseModelId: payload.baseModelId,
    trainingJobId: payload.trainingJobId,
    benchmarkPackId: payload.benchmarkPackId,
    kind,
    formatVersion: 'aimon-ft-v1',
    storageUri: `memory://aimon/artifacts/${artifactId}`,
    metrics: estimateArtifactMetrics(payload),
    config: {
      provider: 'LOCAL',
      model: payload.baseModelId,
      epochs: kind === 'LORA' ? 2 : 1,
      learningRate: kind === 'LORA' ? 0.0002 : 0.0001,
      rank: kind === 'LORA' ? 8 : undefined,
      alpha: kind === 'LORA' ? 16 : undefined,
      batchSize: 4
    },
    createdAt
  };
}

function averageRecentMetrics(results: EvalMatchResult[]): EvalMetrics | null {
  if (results.length === 0) return null;

  const metrics = results.map((result) => result.teamMetrics);
  return {
    returnScore: Number(average(metrics.map((item) => item.returnScore)).toFixed(2)),
    riskScore: Number(average(metrics.map((item) => item.riskScore)).toFixed(2)),
    accuracyScore: Number(average(metrics.map((item) => item.accuracyScore)).toFixed(2)),
    calibrationScore: Number(average(metrics.map((item) => item.calibrationScore)).toFixed(2)),
    reasoningScore: Number(average(metrics.map((item) => item.reasoningScore)).toFixed(2)),
    coordinationScore: Number(average(metrics.map((item) => item.coordinationScore)).toFixed(2)),
    totalScore: Number(average(metrics.map((item) => item.totalScore)).toFixed(2))
  };
}

export function buildFineTuneBundle(
  bundle: TrainingDatasetBundle,
  agentId: string,
  baseModelId: string,
  trainingJobId: string,
  kind: 'SFT' | 'LORA'
): FineTuneJobPayload {
  const filtered = filterExamplesForAgent(bundle, agentId);
  return {
    trainingJobId,
    agentId,
    baseModelId,
    benchmarkPackId: bundle.benchmarkPackId,
    kind,
    trainSftExamples: collectExamplesByIds(filtered.sftExamples, bundle.trainIds),
    validSftExamples: collectExamplesByIds(filtered.sftExamples, bundle.validIds),
    testSftExamples: collectExamplesByIds(filtered.sftExamples, bundle.testIds),
    preferenceExamples: filtered.preferenceExamples,
    createdAt: Date.now()
  };
}

export async function runSftJob(payload: FineTuneJobPayload): Promise<FineTuneArtifactManifest> {
  return buildManifest(payload, 'SFT');
}

export async function runLoraJob(payload: FineTuneJobPayload): Promise<FineTuneArtifactManifest> {
  return buildManifest(payload, 'LORA');
}

export function registerArtifact(manifest: FineTuneArtifactManifest): ModelArtifact {
  return {
    id: manifest.artifactId,
    agentId: manifest.agentId,
    baseModelId: manifest.baseModelId,
    benchmarkPackId: manifest.benchmarkPackId,
    trainingJobId: manifest.trainingJobId,
    kind: manifest.kind,
    label: `${manifest.kind} candidate ${new Date(manifest.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`,
    storageUri: manifest.storageUri,
    status: 'CANDIDATE',
    metrics: manifest.metrics,
    createdAt: manifest.createdAt
  };
}

export async function evaluateArtifactAgainstBenchmark(
  artifactId: string,
  benchmarkPackId: string
): Promise<PromotionCandidateComparison> {
  const artifact = get(labStore).modelArtifacts.find((item) => item.id === artifactId);
  const relatedResults = get(matchStore).recentResults.filter((result) => `benchmark-${result.scenarioId}` === benchmarkPackId);
  const baseline = averageRecentMetrics(relatedResults) ?? defaultMetrics(benchmarkPackId);

  return comparePromotionCandidates(baseline, artifact?.metrics ?? defaultMetrics(benchmarkPackId), benchmarkPackId, undefined, artifactId);
}

export async function promoteArtifact(artifactId: string, agentId: string): Promise<void> {
  labStore.update((state) => ({
    ...state,
    modelArtifacts: state.modelArtifacts.map((artifact) => {
      if (artifact.agentId !== agentId) return artifact;
      if (artifact.id === artifactId) {
        return {
          ...artifact,
          status: 'ACTIVE',
          promotedAt: Date.now()
        };
      }

      return artifact.status === 'ACTIVE' ? { ...artifact, status: 'ROLLED_BACK' } : artifact;
    })
  }));

  updateAgentConfiguration(agentId, {
    activeArtifactId: artifactId,
    status: 'READY'
  });
}

export async function rollbackArtifact(agentId: string, previousArtifactId: string): Promise<void> {
  labStore.update((state) => ({
    ...state,
    modelArtifacts: state.modelArtifacts.map((artifact) => {
      if (artifact.agentId !== agentId) return artifact;
      if (artifact.id === previousArtifactId) {
        return {
          ...artifact,
          status: 'ACTIVE',
          promotedAt: Date.now()
        };
      }

      return artifact.status === 'ACTIVE' ? { ...artifact, status: 'ROLLED_BACK' } : artifact;
    })
  }));

  updateAgentConfiguration(agentId, {
    activeArtifactId: previousArtifactId,
    status: 'READY'
  });
}
