import type { PageServerLoad } from './$types';
import { getDoctrineQuickPrompts } from '$lib/server/doctrineTerminal';

export const load: PageServerLoad = () => ({
  quickPrompts: getDoctrineQuickPrompts(),
});
