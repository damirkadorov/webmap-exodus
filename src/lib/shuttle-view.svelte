<script lang="ts">
	import { formatPrice, shuttleConfig, shuttleGroupColors, type Shuttle } from '$lib';
    import { resolve } from "$app/paths";

	interface Props {
		shuttle: Shuttle;
	}

	let { shuttle }: Props = $props();
	let borderColor = $derived(shuttleGroupColors[shuttle.group] ?? '#0B9FC0');
</script>

<style>
.shuttle-view {
    background-color: rgba(0, 0, 0, 0.25);
    min-width: 300px;
    width: 100%;
    min-height: 256px; /* for tests */
    border-block: 3px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
}
.shuttle-view:hover {
    background-color: var(--secondary-dark);
}
</style>

<a class="block shuttle-view" style="--border-color: {borderColor}" href={resolve(`/shuttle?id=${shuttle.id}`)}>
	<div class="w-full h-fit flex justify-center items-center p-3">
		<img src={resolve(shuttle.image)} alt={shuttle.name} class="w-fit h-[256px]" />
	</div>
	<div class="flex flex-col p-3 gap-1.5">
		<div class="w-full h-fit flex flex-row justify-between items-center gap-3">
			<span class="h1 text-white!">{shuttle.name}</span>
			<span style="color: {borderColor}">{shuttleConfig.shipyard[shuttle.group]}</span>
		</div>
		{#if shuttle.price > 0}
			<div class="w-full h-fit flex flex-row justify-between items-center">
				<span class="text-(--text-primary-2)">Стоимость: {formatPrice(shuttle.price)}</span>
			</div>
		{/if}
	</div>
</a>
