<script lang="ts">
	import { goto } from '$app/navigation';
	import { useInput } from '../../../hooks/useInput';
	import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';
	import { authStore, register } from '../states/authStore';

	const { value: name } = useInput('');
	const { value: email } = useInput('');
	const { value: password } = useInput('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!$name.trim() || !$email.trim() || !$password) {
			await showErrorDialog('Nama, email, dan kata sandi wajib diisi');
			return;
		}
		if ($password.length < 6) {
			await showErrorDialog('Kata sandi minimal 6 karakter');
			return;
		}
		if (await register($name.trim(), $email.trim(), $password)) {
			await showSuccessDialog($authStore.message);
			await goto('/auth/login');
		} else {
			await showErrorDialog($authStore.message);
		}
	}
</script>

<section>
	<h2 class="text-3xl font-extrabold text-ink-900">Daftar</h2>
	<p class="mt-2 text-sm text-ink-500">Buat akun untuk mengikuti atau membuat kursus.</p>

	<form class="mt-8 space-y-5" onsubmit={handleSubmit} novalidate>
		<div>
			<label class="label" for="register-name">Nama</label>
			<input id="register-name" type="text" class="input" placeholder="Nama lengkap" bind:value={$name} />
		</div>
		<div>
			<label class="label" for="register-email">Email</label>
			<input id="register-email" type="email" class="input" placeholder="nama@delcom.org" bind:value={$email} />
		</div>
		<div>
			<label class="label" for="register-password">Kata sandi</label>
			<input id="register-password" type="password" class="input" placeholder="Minimal 6 karakter" bind:value={$password} />
		</div>
		<button type="submit" class="btn btn-primary w-full" disabled={$authStore.isAuthLoading}>Daftar</button>
	</form>

	<p class="mt-6 text-center text-sm text-ink-500">
		Sudah punya akun?
		<a href="/auth/login" class="font-semibold text-ink-700 underline">Masuk</a>
	</p>
</section>
