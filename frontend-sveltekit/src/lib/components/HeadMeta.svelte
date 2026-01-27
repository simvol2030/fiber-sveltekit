<script lang="ts">
	/**
	 * HeadMeta - SEO meta tags component
	 *
	 * Usage:
	 * <HeadMeta
	 *   title="Page Title"
	 *   description="Page description for search engines"
	 *   image="/og-image.png"
	 *   type="website"
	 * />
	 */

	interface Props {
		title: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'product';
		url?: string;
		siteName?: string;
		twitterCard?: 'summary' | 'summary_large_image';
		noindex?: boolean;
		canonical?: string;
		keywords?: string;
		author?: string;
		publishedTime?: string;
		modifiedTime?: string;
	}

	let {
		title,
		description = '',
		image = '',
		type = 'website',
		url = '',
		siteName = 'My App',
		twitterCard = 'summary_large_image',
		noindex = false,
		canonical = '',
		keywords = '',
		author = '',
		publishedTime = '',
		modifiedTime = ''
	}: Props = $props();

	// Format title with site name
	let fullTitle = $derived(title ? `${title} | ${siteName}` : siteName);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}
	{#if author}
		<meta name="author" content={author} />
	{/if}

	<!-- Robots -->
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Canonical URL -->
	{#if canonical}
		<link rel="canonical" href={canonical} />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	{#if image}
		<meta property="og:image" content={image} />
	{/if}
	{#if url}
		<meta property="og:url" content={url} />
	{/if}
	<meta property="og:site_name" content={siteName} />

	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:title" content={title} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	{#if image}
		<meta name="twitter:image" content={image} />
	{/if}

	<!-- Article specific (for blog posts) -->
	{#if type === 'article'}
		{#if publishedTime}
			<meta property="article:published_time" content={publishedTime} />
		{/if}
		{#if modifiedTime}
			<meta property="article:modified_time" content={modifiedTime} />
		{/if}
		{#if author}
			<meta property="article:author" content={author} />
		{/if}
	{/if}
</svelte:head>
