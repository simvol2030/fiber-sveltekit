/**
 * Admin Store using Svelte 5 Runes
 * Manages admin panel state
 */

// Sidebar state
let sidebarCollapsed = $state(false);
let sidebarMobileOpen = $state(false);

// Theme state
let theme = $state<'light' | 'dark'>('light');

// Toast notifications
interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number;
}

let toasts = $state<Toast[]>([]);

// Initialize theme from localStorage
export function initTheme() {
	if (typeof window !== 'undefined') {
		const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark' | null;
		if (savedTheme) {
			theme = savedTheme;
			document.documentElement.setAttribute('data-theme', savedTheme);
		}
	}
}

// Toggle theme
export function toggleTheme() {
	theme = theme === 'light' ? 'dark' : 'light';
	if (typeof window !== 'undefined') {
		localStorage.setItem('admin-theme', theme);
		document.documentElement.setAttribute('data-theme', theme);
	}
}

// Toggle sidebar
export function toggleSidebar() {
	sidebarCollapsed = !sidebarCollapsed;
	if (typeof window !== 'undefined') {
		localStorage.setItem('admin-sidebar-collapsed', String(sidebarCollapsed));
	}
}

// Toggle mobile sidebar
export function toggleMobileSidebar() {
	sidebarMobileOpen = !sidebarMobileOpen;
}

// Close mobile sidebar
export function closeMobileSidebar() {
	sidebarMobileOpen = false;
}

// Initialize sidebar state from localStorage
export function initSidebar() {
	if (typeof window !== 'undefined') {
		const savedState = localStorage.getItem('admin-sidebar-collapsed');
		if (savedState === 'true') {
			sidebarCollapsed = true;
		}
	}
}

// Toast functions
function generateId(): string {
	return Math.random().toString(36).substring(2, 9);
}

function addToast(type: Toast['type'], message: string, duration = 5000) {
	const id = generateId();
	const toast: Toast = { id, type, message, duration };
	toasts = [...toasts, toast];

	if (duration > 0) {
		setTimeout(() => {
			removeToast(id);
		}, duration);
	}

	return id;
}

function removeToast(id: string) {
	toasts = toasts.filter((t) => t.id !== id);
}

export const toast = {
	success: (message: string, duration?: number) => addToast('success', message, duration),
	error: (message: string, duration?: number) => addToast('error', message, duration),
	info: (message: string, duration?: number) => addToast('info', message, duration),
	warning: (message: string, duration?: number) => addToast('warning', message, duration),
	remove: removeToast
};

// Get admin state (for use in components)
export function getAdminState() {
	return {
		get sidebarCollapsed() {
			return sidebarCollapsed;
		},
		get sidebarMobileOpen() {
			return sidebarMobileOpen;
		},
		get theme() {
			return theme;
		},
		get toasts() {
			return toasts;
		}
	};
}
