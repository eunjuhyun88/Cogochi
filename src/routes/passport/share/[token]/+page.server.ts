import { error } from '@sveltejs/kit';
import { readPublishedPassportByToken } from '$lib/server/passportExport';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const record = await readPublishedPassportByToken(params.token);

  if (!record) {
    throw error(404, 'Published passport snapshot not found.');
  }

  return {
    snapshot: record.snapshot,
  };
};
