import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3000,
		host: true,
		proxy: {
			'/api': {
				target: process.env.API_URL || 'http://localhost:3001',
				changeOrigin: true
			}
		}
	},
	preview: {
		port: 3000,
		host: true
	}
});
