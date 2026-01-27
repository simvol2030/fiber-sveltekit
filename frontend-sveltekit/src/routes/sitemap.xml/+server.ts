import type { RequestHandler } from './$types';

/**
 * Dynamic Sitemap.xml for SEO
 *
 * Customize this for your project:
 * - Add dynamic pages from database
 * - Add blog posts, products, etc.
 * - Set correct changefreq and priority
 */
export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;

	// Static pages - customize for your project
	const staticPages = [
		{ path: '/', changefreq: 'daily', priority: '1.0' },
		{ path: '/login', changefreq: 'monthly', priority: '0.3' },
		{ path: '/register', changefreq: 'monthly', priority: '0.3' }
	];

	// TODO: Add dynamic pages from your database
	// Example:
	// const posts = await db.query('SELECT slug, updated_at FROM posts WHERE published = true');
	// const dynamicPages = posts.map(post => ({
	//   path: `/blog/${post.slug}`,
	//   lastmod: post.updated_at.toISOString(),
	//   changefreq: 'weekly',
	//   priority: '0.7'
	// }));

	const dynamicPages: { path: string; lastmod?: string; changefreq: string; priority: string }[] =
		[];

	const allPages = [...staticPages, ...dynamicPages];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(page) => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600' // 1 hour
		}
	});
};
