import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

// SvelteKit 3: konfigurasi (termasuk adapter) dikirim ke plugin `sveltekit`,
// bukan lagi lewat svelte.config.js.
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const port = Number(env.APP_PORT ?? 3005);

	return {
		plugins: [
			tailwindcss(),
			sveltekit({ adapter: adapter() }),
			svelteTesting()
		],
		server: { port, strictPort: true },
		preview: { port },
		test: {
			environment: 'jsdom',
			setupFiles: ['./vitest-setup.ts'],
			include: ['src/**/*.test.ts'],
			clearMocks: true,
			coverage: {
				provider: 'v8',
				reporter: ['text', 'html'],
				include: ['src/**/*.{ts,svelte}'],
				exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/test-utils.ts'],
				thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 }
			}
		}
	};
});
