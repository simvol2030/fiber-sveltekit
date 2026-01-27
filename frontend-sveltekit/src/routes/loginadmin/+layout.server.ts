import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Server-side authentication and authorization check for admin panel
 *
 * Checks:
 * 1. User is authenticated (has valid refresh token)
 * 2. User has admin role
 */
export const load: LayoutServerLoad = async ({ cookies, fetch, url }) => {
	// Check for refresh token cookie
	const refreshToken = cookies.get('refresh_token');

	if (!refreshToken) {
		throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	try {
		// Validate token and check role with backend
		const response = await fetch('/api/auth/me');

		if (!response.ok) {
			throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
		}

		const data = await response.json();
		const user = data.data;

		// Check if user has admin role
		if (user.role !== 'admin') {
			// User is authenticated but not admin - redirect to dashboard
			throw redirect(302, '/dashboard?error=unauthorized');
		}

		return {
			user
		};
	} catch (error) {
		if (error instanceof Response || (error as { status?: number }).status === 302) {
			throw error;
		}
		throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
};
