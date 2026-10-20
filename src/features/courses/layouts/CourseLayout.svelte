<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavbarComponent from '../components/NavbarComponent.svelte';
	import SidebarComponent from '../components/SidebarComponent.svelte';

	let { children }: { children: Snippet } = $props();

	let sidebarOpen = $state(false);
</script>

<div class="min-h-screen bg-ink-50">
	<NavbarComponent onmenu={() => (sidebarOpen = true)} />
	<SidebarComponent open={sidebarOpen} onclose={() => (sidebarOpen = false)} />
	<main class="pt-16 lg:pl-64">
		<div class="mx-auto max-w-6xl p-4 sm:p-8">
			{@render children()}
		</div>
	</main>
</div>
