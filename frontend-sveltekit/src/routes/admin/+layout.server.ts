import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Server-side authentication and authorization check for admin panel
 *
 * Flow:
 * 1. Check refresh token cookie exists
 * 2. Call /api/auth/refresh to get access token (cookie-based)
 * 3. Call /api/auth/me with access token to verify admin role
 */
export const load: LayoutServerLoad = async ({ cookies, fetch, url }) => {
	const refreshToken = cookies.get('refresh_token');

	if (!refreshToken) {
		throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	try {
		// Step 1: Get access token via refresh (sends cookie automatically)
		const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });

		if (!refreshResponse.ok) {
			throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
		}

		const refreshData = await refreshResponse.json();
		const accessToken = refreshData.data?.accessToken;

		if (!accessToken) {
			throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
		}

		// Step 2: Validate user and check role with access token
		const meResponse = await fetch('/api/auth/me', {
			headers: { 'Authorization': `Bearer ${accessToken}` }
		});

		if (!meResponse.ok) {
			throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
		}

		const meData = await meResponse.json();
		const user = meData.data;

		// Step 3: Check admin role
		if (user.role !== 'admin') {
			throw redirect(302, '/dashboard?error=unauthorized');
		}

		return { user };
	} catch (error) {
		if (error instanceof Response || (error as { status?: number }).status === 302) {
			throw error;
		}
		throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
};
