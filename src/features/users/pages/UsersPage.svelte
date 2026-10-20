<script lang="ts">
	import { onMount } from 'svelte';
	import { formatDate, resolveAssetUrl } from '../../../helpers/toolsHelper';
	import { fetchUsers, usersStore } from '../states/usersStore';

	onMount(() => {
		fetchUsers();
	});
</script>

<section>
	<header class="mb-6">
		<h1 class="text-2xl font-bold text-ink-900">Daftar Pengguna</h1>
		<p class="text-sm text-ink-500">Semua pengajar dan pelajar yang terdaftar di Delcom Courses.</p>
	</header>

	{#if $usersStore.isUsersLoading}
		<p class="py-16 text-center text-ink-500">Memuat pengguna…</p>
	{:else if $usersStore.users.length === 0}
		<p class="card py-16 text-center text-ink-500">Belum ada pengguna.</p>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each $usersStore.users as user (user.id)}
				<li class="card flex items-center gap-4 p-4">
					<img
						src={resolveAssetUrl(user.photo)}
						alt={`Foto ${user.name}`}
						class="size-14 rounded-full bg-ink-100 object-cover"
					/>
					<div class="min-w-0">
						<p class="truncate font-semibold text-ink-900">{user.name}</p>
						<p class="truncate text-sm text-ink-500">{user.email}</p>
						<p class="text-xs text-ink-500">Bergabung {formatDate(user.created_at)}</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
