<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import Header from '$lib/header.svelte';
	import configJson from '$root/config.json' with { type: 'json' };
	import Footer from '../lib/footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{configJson.name}</title>
</svelte:head>

<div class="flex h-full min-h-fit w-full flex-1 flex-col">
	<Header />
	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>
	<Footer />
</div>
