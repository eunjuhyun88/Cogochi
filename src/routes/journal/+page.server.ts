import type { PageServerLoad } from './$types';
import { getHistoricalChartFrame } from '$lib/engine/chart-frame-model';
import { readRuntimeArtifacts } from '$lib/server/runtimeArtifacts';
import type { MutationDecision } from '$lib/types';

export const load: PageServerLoad = ({ url }) => {
  const outcomeParam = url.searchParams.get('return');
  const verdictParam = url.searchParams.get('verdict');
  const gateParam = url.searchParams.get('gate');
  const frameId = url.searchParams.get('frame');
  const frame = frameId ? getHistoricalChartFrame(frameId) : null;

  const returnContext = {
    artifactId: url.searchParams.get('artifact'),
    outcome: outcomeParam === 'WIN' || outcomeParam === 'LOSS' ? outcomeParam : null,
    verdict: verdictParam === 'ACCEPTED' || verdictParam === 'REVERTED' || verdictParam === 'QUARANTINED'
      ? (verdictParam as MutationDecision)
      : null,
    gate: gateParam === 'spar' || gateParam === 'proof' ? gateParam : null,
    frameId: frame?.id ?? frameId ?? null,
    frameTitle: frame?.title ?? null,
    frameDateLabel: frame?.dateLabel ?? null,
    agentId: url.searchParams.get('agent'),
    doctrineSessionId: url.searchParams.get('session'),
    proofPackId: url.searchParams.get('pack'),
  };

  return {
    runtime: readRuntimeArtifacts(),
    returnContext,
  };
};
