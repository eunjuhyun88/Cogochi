import { json } from '@sveltejs/kit';
import { testRuntimeConnection } from '$lib/aimon/services/modelProvider';
import type { RequestHandler } from './$types';
import type { RuntimeConfig } from '$lib/aimon/types';

export const POST: RequestHandler = async ({ request }) => {
  const payload = (await request.json()) as {
    config?: RuntimeConfig;
  };

  if (!payload?.config) {
    return json({ error: 'Missing runtime config.' }, { status: 400 });
  }

  const result = await testRuntimeConnection(payload.config);
  return json(result, { status: result.ok ? 200 : 502 });
};
