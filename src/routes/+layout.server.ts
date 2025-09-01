
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals, url }) => {
  return { user: locals.user, org: locals.org, path: url.pathname };
};
