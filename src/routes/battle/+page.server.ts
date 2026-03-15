import type { PageServerLoad } from './$types';
import { readRuntimeArtifacts } from '$lib/server/runtimeArtifacts';

export const load: PageServerLoad = ({ url }) => ({
  runtime: readRuntimeArtifacts(),
  selectedAgentId: url.searchParams.get('agent'),
  selectedDoctrineSessionId: url.searchParams.get('session'),
  selectedProofPackId: url.searchParams.get('pack'),
});
