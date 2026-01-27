import type { LayoutLoad } from './$types';

/**
 * Root layout load function
 *
 * This runs on both server and client for every page navigation.
 * Use this for:
 * - Preloading data needed on all pages
 * - Setting up dependencies for invalidation
 * - SSR data fetching
 *
 * Note: For client-only auth initialization, use +layout.svelte with onMount
 * because auth depends on httpOnly cookies which aren't available during SSR.
 */
export const load: LayoutLoad = async ({ url, fetch: _fetch, depends }) => {
	// Register dependencies for manual invalidation
	// Call invalidate('app:auth') to re-run this load function
	depends('app:auth');
	depends('app:layout');

	return {
		// Pass URL info to all pages
		url: url.pathname,

		// You can preload common data here that all pages need
		// Example:
		// const settings = await fetch('/api/settings').then(r => r.json());
		// return { url: url.pathname, settings };
	};
};

/**
 * Prerender configuration
 * Set to true for static pages, false for dynamic
 */
export const prerender = false;

/**
 * SSR configuration
 * Set to false if the page requires client-only features
 */
export const ssr = true;

/**
 * CSR configuration
 * Set to false to disable client-side navigation (full page reloads)
 */
export const csr = true;
