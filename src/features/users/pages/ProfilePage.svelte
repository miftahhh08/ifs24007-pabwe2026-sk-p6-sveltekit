<script lang="ts">
	import { Camera, KeyRound, User as UserIcon } from 'lucide-svelte';
	import { useInput } from '../../../hooks/useInput';
	import { formatDate, notifyResult, resolveAssetUrl, showErrorDialog } from '../../../helpers/toolsHelper';
	import { changePassword, changePhoto, changeProfile, usersStore } from '../states/usersStore';

	const profile = $derived($usersStore.profile);

	const { value: name } = useInput('');
	const { value: email } = useInput('');
	const { value: password, reset: resetPassword } = useInput('');
	const { value: newPassword, reset: resetNewPassword } = useInput('');
	const { value: confirmation, reset: resetConfirmation } = useInput('');
	let photo = $state<File | undefined>();

	$effect(() => {
		if (profile) {
			name.set(profile.name);
			email.set(profile.email);
		}
	});

	async function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		if (!$name.trim() || !$email.trim()) {
			await showErrorDialog('Nama dan email wajib diisi');
			return;
		}
		await notifyResult(await changeProfile($name.trim(), $email.trim()));
	}

	async function savePhoto(event: SubmitEvent) {
		event.preventDefault();
		if (!photo) {
			await showErrorDialog('Pilih foto terlebih dahulu');
			return;
		}
		await notifyResult(await changePhoto(photo), () => {
			photo = undefined;
		});
	}

	async function savePassword(event: SubmitEvent) {
		event.preventDefault();
		if (!$password || !$newPassword || !$confirmation) {
			await showErrorDialog('Semua kolom kata sandi wajib diisi');
			return;
		}
		if ($newPassword !== $confirmation) {
			await showErrorDialog('Konfirmasi kata sandi baru tidak sama');
			return;
		}
		await notifyResult(await changePassword($password, $newPassword, $confirmation), () => {
			resetPassword();
			resetNewPassword();
			resetConfirmation();
		});
	}
</script>

<section class="space-y-6">
	<header>
		<h1 class="text-2xl font-bold text-ink-900">Profil Saya</h1>
		<p class="text-sm text-ink-500">Kelola data akun, foto, dan kata sandi.</p>
	</header>

	{#if profile}
		<div class="card flex items-center gap-5 p-6">
			<img
				src={resolveAssetUrl(profile.photo)}
				alt="Foto profil"
				class="size-20 rounded-full bg-ink-100 object-cover"
			/>
			<div>
				<p class="text-lg font-bold text-ink-900">{profile.name}</p>
				<p class="text-sm text-ink-500">{profile.email}</p>
				<p class="text-xs text-ink-500">Bergabung {formatDate(profile.created_at)}</p>
			</div>
		</div>
	{/if}

	<div class="grid gap-6 lg:grid-cols-2">
		<form class="card space-y-4 p-6" onsubmit={saveProfile} novalidate>
			<h2 class="flex items-center gap-2 font-bold text-ink-900"><UserIcon size={18} /> Ubah data akun</h2>
			<div>
				<label class="label" for="profile-name">Nama</label>
				<input id="profile-name" type="text" class="input" bind:value={$name} />
			</div>
			<div>
				<label class="label" for="profile-email">Email</label>
				<input id="profile-email" type="email" class="input" bind:value={$email} />
			</div>
			<button type="submit" class="btn btn-primary" disabled={$usersStore.isProfileChange}>Simpan data</button>
		</form>

		<form class="card space-y-4 p-6" onsubmit={savePhoto} novalidate>
			<h2 class="flex items-center gap-2 font-bold text-ink-900"><Camera size={18} /> Ganti foto</h2>
			<div>
				<label class="label" for="profile-photo">Berkas foto</label>
				<input
					id="profile-photo"
					type="file"
					accept="image/*"
					class="input"
					onchange={(event) => (photo = event.currentTarget.files![0])}
				/>
			</div>
			<button type="submit" class="btn btn-primary" disabled={$usersStore.isPhotoChange}>Unggah foto</button>
		</form>

		<form class="card space-y-4 p-6 lg:col-span-2" onsubmit={savePassword} novalidate>
			<h2 class="flex items-center gap-2 font-bold text-ink-900"><KeyRound size={18} /> Ganti kata sandi</h2>
			<div class="grid gap-4 sm:grid-cols-3">
				<div>
					<label class="label" for="password-old">Kata sandi lama</label>
					<input id="password-old" type="password" class="input" bind:value={$password} />
				</div>
				<div>
					<label class="label" for="password-new">Kata sandi baru</label>
					<input id="password-new" type="password" class="input" bind:value={$newPassword} />
				</div>
				<div>
					<label class="label" for="password-confirm">Konfirmasi kata sandi baru</label>
					<input id="password-confirm" type="password" class="input" bind:value={$confirmation} />
				</div>
			</div>
			<button type="submit" class="btn btn-primary" disabled={$usersStore.isPasswordChange}>Ubah kata sandi</button>
		</form>
	</div>
</section>
