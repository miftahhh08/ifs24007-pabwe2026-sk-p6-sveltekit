<script lang="ts">
	import { BookOpen, User, Users } from 'lucide-svelte';
	import { page } from '$app/state';

	let { open, onclose }: { open: boolean; onclose: () => void } = $props();

	const isActive = (href: string) =>
		href === '/'
			? page.url.pathname === '/' || page.url.pathname.startsWith('/courses')
			: page.url.pathname.startsWith(href);

	const linkClass = (href: string) => [
		'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
		isActive(href) ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-50'
	];
</script>

{#if open}
	<button
		type="button"
		class="fixed inset-0 z-30 bg-black/40 lg:hidden"
		aria-label="Tutup menu"
		onclick={onclose}
	></button>
{/if}

<aside
	data-open={open}
	class={[
		'fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-ink-100 bg-white p-4 transition-transform lg:translate-x-0',
		open ? 'translate-x-0' : '-translate-x-full'
	]}
>
	<nav class="space-y-1" aria-label="Menu utama">
		<a href="/" aria-current={isActive('/') ? 'page' : undefined} class={linkClass('/')} onclick={onclose}>
			<BookOpen size={18} /> Semua Kursus
		</a>
		<a href="/users" aria-current={isActive('/users') ? 'page' : undefined} class={linkClass('/users')} onclick={onclose}>
			<Users size={18} /> Daftar Pengguna
		</a>
		<a href="/profile" aria-current={isActive('/profile') ? 'page' : undefined} class={linkClass('/profile')} onclick={onclose}>
			<User size={18} /> Profil Saya
		</a>
	</nav>
</aside>
