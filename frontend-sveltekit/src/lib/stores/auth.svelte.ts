/**
 * Auth Store using Svelte 5 Runes
 * Manages authentication state with reactive primitives
 */

import { api, type User } from '$api/client';

// Auth state using Svelte 5 runes
let user = $state<User | null>(null);
let isLoading = $state(true);
let isAuthenticated = $derived(user !== null);
let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize auth state - call on app startup
 * Ensures initialization only happens once
 */
export async function initAuth(): Promise<void> {
	// If already initialized, return immediately
	if (isInitialized) {
		return;
	}

	// If initialization is in progress, wait for it
	if (initPromise) {
		return initPromise;
	}

	initPromise = doInitAuth();
	await initPromise;
}

async function doInitAuth(): Promise<void> {
	isLoading = true;
	try {
		// Try to get current user (will use refresh token if needed)
		const response = await api.getMe();
		if (response.success && response.data) {
			user = response.data;
		} else {
			user = null;
		}
	} catch {
		user = null;
	} finally {
		isLoading = false;
		isInitialized = true;
	}
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
	isLoading = true;
	try {
		const response = await api.login({ email, password });
		if (response.success && response.data) {
			user = response.data.user;
			return { success: true };
		}
		return {
			success: false,
			error: response.error?.message || 'Login failed'
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Login failed'
		};
	} finally {
		isLoading = false;
	}
}

/**
 * Register new user
 */
export async function register(
	email: string,
	password: string,
	name?: string
): Promise<{ success: boolean; error?: string }> {
	isLoading = true;
	try {
		const response = await api.register({ email, password, name });
		if (response.success && response.data) {
			user = response.data.user;
			return { success: true };
		}
		return {
			success: false,
			error: response.error?.message || 'Registration failed'
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Registration failed'
		};
	} finally {
		isLoading = false;
	}
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
	await api.logout();
	user = null;
}

/**
 * Get auth state (for use in components)
 */
export function getAuthState() {
	return {
		get user() {
			return user;
		},
		get isLoading() {
			return isLoading;
		},
		get isAuthenticated() {
			return isAuthenticated;
		}
	};
}
