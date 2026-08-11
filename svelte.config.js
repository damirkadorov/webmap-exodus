import adapter from '@sveltejs/adapter-static';
import configJson from './config.json' with { type: 'json' };

const isVercel = Boolean(process.env.VERCEL);
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		paths: {
			base: isProd ? (isVercel ? '' : `/${configJson.base_path}`) : ''
		},
		alias: {
			$root: process.cwd()
		}
	}
};

export default config;
