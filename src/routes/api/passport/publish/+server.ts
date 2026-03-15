import { json } from '@sveltejs/kit';
import { publishPassportSnapshot } from '$lib/server/passportExport';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as { slug?: string; agentId?: string } | null;
  const slug = body?.slug ?? body?.agentId ?? '';

  if (!slug) {
    return json({ error: 'Passport slug is required for publish.' }, { status: 400 });
  }

  const record = await publishPassportSnapshot(slug);

  if (!record?.entry) {
    return json({ error: 'Passport snapshot not found.' }, { status: 404 });
  }

  return json({
    snapshot: record.snapshot,
    href: `/passport/public/${record.snapshot.slug}`,
    shareHref: `/passport/share/${record.entry.shareToken}`,
    publishStatus: record.entry.publishStatus,
  });
};
