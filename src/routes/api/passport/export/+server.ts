import { json } from '@sveltejs/kit';
import { readPassportRecord, writePassportSnapshot } from '$lib/server/passportExport';
import type { RequestHandler } from './$types';
import type { PassportSnapshotInput } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as PassportSnapshotInput | null;

  if (!body?.agentId || !body.agentName) {
    return json({ error: 'Agent identity is required for passport export.' }, { status: 400 });
  }

  if (!Array.isArray(body.publicArtifacts) || body.publicArtifacts.length === 0) {
    return json({ error: 'At least one public-ready proof artifact is required.' }, { status: 400 });
  }

  const snapshot = await writePassportSnapshot(body);
  const record = await readPassportRecord(snapshot.slug);

  return json({
    snapshot,
    href: `/passport/public/${snapshot.slug}`,
    shareHref: record?.entry?.publishStatus === 'PUBLISHED' ? `/passport/share/${record.entry.shareToken}` : null,
    publishStatus: record?.entry?.publishStatus ?? snapshot.publishStatus,
  });
};
