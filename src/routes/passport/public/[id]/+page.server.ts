import { error } from '@sveltejs/kit';
import { readPassportSnapshot } from '$lib/server/passportExport';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const snapshot = await readPassportSnapshot(params.id);

  if (!snapshot) {
    throw error(404, 'Passport snapshot not found.');
  }

  return {
    snapshot,
  };
};
