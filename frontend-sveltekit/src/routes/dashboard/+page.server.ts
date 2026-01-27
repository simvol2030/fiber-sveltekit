import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Server-side authentication check for dashboard
 *
 * This runs on the server BEFORE any HTML is sent to the client.
 * Benefits:
 * - Prevents flash of protected content
 * - Proper HTTP 302 redirect for bots/crawlers
 * - No client-side JavaScript required for auth check
 *
 * Note: This requires the refresh_token cookie to be sent with the request.
 * For full server-side auth, you'd validate the token with the backend here.
 */
export const load: PageServerLoad = async ({ cookies, fetch }) => {
	// Check for refresh token cookie (indicates user might be authenticated)
	const refreshToken = cookies.get('refresh_token');

	if (!refreshToken) {
		// No token = not authenticated, redirect to login
		throw redirect(302, '/login?redirect=/dashboard');
	}

	// Optional: Validate token with backend for stricter security
	// This ensures the token is actually valid, not just present
	try {
		const response = await fetch('/api/auth/me', {
			headers: {
				// Cookie is automatically forwarded by SvelteKit fetch
			}
		});

		if (!response.ok) {
			// Token invalid or expired, redirect to login
			throw redirect(302, '/login?redirect=/dashboard');
		}

		// User is authenticated, return user data for the page
		const data = await response.json();
		return {
			user: data.data
		};
	} catch (error) {
		// Network error or other issue, redirect to login
		if (error instanceof Response || (error as { status?: number }).status === 302) {
			throw error; // Re-throw redirects
		}
		throw redirect(302, '/login?redirect=/dashboard');
	}
};
