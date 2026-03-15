import { json } from '@sveltejs/kit';
import { readPassportRecord } from '$lib/server/passportExport';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const record = await readPassportRecord(params.id);

  if (!record?.snapshot) {
    return json({ error: 'Passport snapshot not found.' }, { status: 404 });
  }

  return json({
    snapshot: record.snapshot,
    href: `/passport/public/${record.snapshot.slug}`,
    shareHref: record.entry?.publishStatus === 'PUBLISHED' ? `/passport/share/${record.entry.shareToken}` : null,
    publishStatus: record.entry?.publishStatus ?? record.snapshot.publishStatus,
  });
};
