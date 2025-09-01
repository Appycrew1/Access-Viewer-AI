
import adapter from '@sveltejs/adapter-vercel';
const config = { kit: { adapter: adapter(), alias: { '@/*': './src/*' } } };
export default config;
