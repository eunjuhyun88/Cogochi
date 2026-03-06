import { json } from '@sveltejs/kit';
import { runRuntimeAgentDecision } from '$lib/aimon/services/modelProvider';
import type { RequestHandler } from './$types';
import type { AgentDecisionContext, RuntimeConfig } from '$lib/aimon/types';

export const POST: RequestHandler = async ({ request }) => {
  const payload = (await request.json()) as {
    context?: AgentDecisionContext;
    config?: RuntimeConfig;
  };

  if (!payload?.context || !payload?.config) {
    return json({ error: 'Missing context or config.' }, { status: 400 });
  }

  const trace = await runRuntimeAgentDecision(payload.context, payload.config);
  return json({ trace });
};
