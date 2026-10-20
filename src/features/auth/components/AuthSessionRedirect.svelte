<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getAccessToken } from '../../../helpers/apiHelper';
	import { fetchProfile, usersStore } from '../../users/states/usersStore';
	import { authStore } from '../states/authStore';

	const isAuthRoute = $derived(page.url.pathname.startsWith('/auth'));

	onMount(() => {
		if (getAccessToken()) {
			fetchProfile();
		} else if (!isAuthRoute) {
			goto('/auth/login');
		}
	});

	// Login berhasil dan profil sudah tersedia -> masuk ke beranda.
	$effect(() => {
		if ($usersStore.profile && isAuthRoute) goto('/');
	});

	// Sesi berakhir (logout atau token tidak valid) -> kembali ke halaman login.
	$effect(() => {
		if (($authStore.isAuthLogout || $usersStore.isProfileFailed) && !isAuthRoute) {
			goto('/auth/login');
		}
	});
</script>
