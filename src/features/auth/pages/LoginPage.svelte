<script lang="ts">
	import { useInput } from '../../../hooks/useInput';
	import { showErrorDialog } from '../../../helpers/toolsHelper';
	import { fetchProfile } from '../../users/states/usersStore';
	import { authStore, login } from '../states/authStore';

	const { value: email } = useInput('');
	const { value: password } = useInput('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!$email.trim() || !$password) {
			await showErrorDialog('Email dan kata sandi wajib diisi');
			return;
		}
		if (await login($email.trim(), $password)) {
			// Redirect ke "/" dilakukan AuthSessionRedirect setelah profil tersedia.
			await fetchProfile();
		} else {
			await showErrorDialog($authStore.message);
		}
	}
</script>

<section>
	<h2 class="text-3xl font-extrabold text-ink-900">Masuk</h2>
	<p class="mt-2 text-sm text-ink-500">Lanjutkan belajar atau kelola kursusmu.</p>

	<form class="mt-8 space-y-5" onsubmit={handleSubmit} novalidate>
		<div>
			<label class="label" for="login-email">Email</label>
			<input id="login-email" type="email" class="input" placeholder="nama@delcom.org" bind:value={$email} />
		</div>
		<div>
			<label class="label" for="login-password">Kata sandi</label>
			<input id="login-password" type="password" class="input" placeholder="Kata sandi" bind:value={$password} />
		</div>
		<button type="submit" class="btn btn-primary w-full" disabled={$authStore.isAuthLoading}>Masuk</button>
	</form>

	<p class="mt-6 text-center text-sm text-ink-500">
		Belum punya akun?
		<a href="/auth/register" class="font-semibold text-ink-700 underline">Daftar</a>
	</p>
</section>
