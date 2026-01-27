import type { RequestHandler } from './$types';

/**
 * Robots.txt for SEO
 *
 * Customize this for your project:
 * - Add Disallow rules for private pages
 * - Update Sitemap URL to your domain
 */
export const GET: RequestHandler = async ({ url }) => {
	const sitemapUrl = `${url.origin}/sitemap.xml`;

	const robotsTxt = `# Robots.txt
# https://www.robotstxt.org/

User-agent: *
Allow: /

# Private/Admin areas
Disallow: /dashboard
Disallow: /admin
Disallow: /api/

# Sitemap
Sitemap: ${sitemapUrl}
`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400' // 24 hours
		}
	});
};
