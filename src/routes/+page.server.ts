
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals }) => {
  if(locals.user) return { redirect: '/app' };
  return {};
};
