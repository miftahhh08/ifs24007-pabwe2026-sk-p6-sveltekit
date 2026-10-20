<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import AuthSessionRedirect from '../features/auth/components/AuthSessionRedirect.svelte';
	import CourseLayout from '../features/courses/layouts/CourseLayout.svelte';

	let { children }: { children: Snippet } = $props();

	const isAuthRoute = $derived(page.url.pathname.startsWith('/auth'));
</script>

<AuthSessionRedirect />

{#if isAuthRoute}
	{@render children()}
{:else}
	<CourseLayout>
		{@render children()}
	</CourseLayout>
{/if}
