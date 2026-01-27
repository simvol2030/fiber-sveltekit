<script lang="ts">
	/**
	 * SchemaOrg - Structured data component for SEO
	 *
	 * Usage:
	 * <SchemaOrg
	 *   type="WebPage"
	 *   data={{
	 *     name: "Page Title",
	 *     description: "Page description"
	 *   }}
	 * />
	 */

	interface Props {
		type:
			| 'WebPage'
			| 'Article'
			| 'Product'
			| 'Organization'
			| 'Person'
			| 'BreadcrumbList'
			| 'FAQPage';
		data: Record<string, unknown>;
	}

	let { type, data }: Props = $props();

	// Build JSON-LD structure
	let jsonLd = $derived(
		JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@type': type,
				...data
			},
			null,
			2
		)
	);
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
