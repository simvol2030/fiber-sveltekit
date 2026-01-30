import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Server-side authentication check for profile page
 * Uses refresh token flow to get access token, then fetches user data
 */
export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
	const refreshToken = cookies.get('refresh_token');

	if (!refreshToken) {
		throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	try {
		// Step 1: Get access token via refresh
		const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });

		if (!refreshResponse.ok) {
			throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
		}

		const refreshData = await refreshResponse.json();
		const accessToken = refreshData.data?.accessToken;

		if (!accessToken) {
			throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
		}

		// Step 2: Get user data
		const meResponse = await fetch('/api/auth/me', {
			headers: { 'Authorization': `Bearer ${accessToken}` }
		});

		if (!meResponse.ok) {
			throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
		}

		const meData = await meResponse.json();

		return { user: meData.data };
	} catch (error) {
		if (error instanceof Response || (error as { status?: number }).status === 302) {
			throw error;
		}
		throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
};
