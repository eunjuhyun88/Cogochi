import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateDoctrineTerminalResult } from '$lib/server/doctrineTerminal';

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = body?.prompt?.trim() ?? '';

  if (!prompt) {
    return json({ error: 'Prompt is required.' }, { status: 400 });
  }

  if (prompt.length > 280) {
    return json({ error: 'Prompt is too long for the doctrine terminal MVP.' }, { status: 400 });
  }

  const result = generateDoctrineTerminalResult(prompt);
  return json(result);
};
