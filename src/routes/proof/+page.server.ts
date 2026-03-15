import type { PageServerLoad } from './$types';
import { getProofPacks } from '$lib/engine/proof-system';
import { readRuntimeArtifacts } from '$lib/server/runtimeArtifacts';

export const load: PageServerLoad = ({ url }) => {
  const proofPacks = getProofPacks();
  const selectedPackId = url.searchParams.get('pack');
  const selectedAgentId = url.searchParams.get('agent');
  const selectedDoctrineSessionId = url.searchParams.get('session');

  return {
    runtime: readRuntimeArtifacts(),
    proofPacks,
    selectedPackId,
    selectedAgentId,
    selectedDoctrineSessionId,
  };
};
