<script lang="ts">
	import { GraduationCap, LogOut, Menu } from 'lucide-svelte';
	import { resolveAssetUrl, showConfirmDialog } from '../../../helpers/toolsHelper';
	import { logout } from '../../auth/states/authStore';
	import { usersStore } from '../../users/states/usersStore';

	let { onmenu }: { onmenu: () => void } = $props();

	const profile = $derived($usersStore.profile);

	async function handleLogout() {
		if (await showConfirmDialog('Keluar dari akun?', 'Sesi kamu akan diakhiri.', 'Keluar')) {
			await logout();
		}
	}
</script>

<header
	class="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6"
>
	<div class="flex items-center gap-3">
		<button type="button" class="btn btn-ghost lg:hidden" aria-label="Buka menu" onclick={onmenu}>
			<Menu size={18} />
		</button>
		<a href="/" class="flex items-center gap-2">
			<span class="flex size-9 items-center justify-center rounded-lg bg-ink-900 text-gold-400">
				<GraduationCap size={20} />
			</span>
			<span class="text-lg font-extrabold text-ink-900">Delcom Courses</span>
		</a>
	</div>

	<div class="flex items-center gap-3">
		{#if profile}
			<img
				src={resolveAssetUrl(profile.photo)}
				alt={`Foto ${profile.name}`}
				class="size-9 rounded-full bg-ink-100 object-cover"
			/>
			<div class="hidden text-right sm:block">
				<p class="text-sm font-semibold text-ink-900">{profile.name}</p>
				<p class="text-xs text-ink-500">{profile.email}</p>
			</div>
		{/if}
		<button type="button" class="btn btn-ghost" onclick={handleLogout}>
			<LogOut size={16} /> Keluar
		</button>
	</div>
</header>
