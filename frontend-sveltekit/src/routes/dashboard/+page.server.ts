import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Server-side authentication check for dashboard
 *
 * Uses the same refresh-then-verify pattern as admin/+layout.server.ts:
 * 1. Call /api/auth/refresh (sends cookie) → get accessToken
 * 2. Call /api/auth/me with Authorization: Bearer header
 *
 * This is required because the backend auth middleware only checks
 * the Authorization: Bearer header, NOT cookies.
 */
export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const refreshToken = cookies.get('refresh_token');

	if (!refreshToken) {
		throw redirect(302, '/login?redirect=/dashboard');
	}

	try {
		// Step 1: Get access token via refresh (sends cookie automatically)
		const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });

		if (!refreshResponse.ok) {
			throw redirect(302, '/login?redirect=/dashboard');
		}

		const refreshData = await refreshResponse.json();
		const accessToken = refreshData.data?.accessToken;

		if (!accessToken) {
			throw redirect(302, '/login?redirect=/dashboard');
		}

		// Step 2: Validate user with access token
		const meResponse = await fetch('/api/auth/me', {
			headers: { 'Authorization': `Bearer ${accessToken}` }
		});

		if (!meResponse.ok) {
			throw redirect(302, '/login?redirect=/dashboard');
		}

		const meData = await meResponse.json();
		return {
			user: meData.data
		};
	} catch (error) {
		if (error instanceof Response || (error as { status?: number }).status === 302) {
			throw error;
		}
		throw redirect(302, '/login?redirect=/dashboard');
	}
};
