<script lang="ts">
	import { X } from 'lucide-svelte';
	import { notifyResult, showErrorDialog } from '../../../helpers/toolsHelper';
	import { changeCover, coursesStore } from '../states/coursesStore';

	let {
		open,
		courseId,
		onclose,
		onsaved
	}: { open: boolean; courseId: number | string; onclose: () => void; onsaved: () => void } = $props();

	let file = $state<File | undefined>();

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!file) {
			await showErrorDialog('Pilih gambar sampul terlebih dahulu');
			return;
		}
		if (!file.type.startsWith('image/')) {
			await showErrorDialog('Berkas sampul harus berupa gambar');
			return;
		}
		await notifyResult(await changeCover(courseId, file), () => {
			file = undefined;
			onclose();
			onsaved();
		});
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="change-cover-heading"
	>
		<form class="card w-full max-w-md space-y-4 p-6" onsubmit={submit} novalidate>
			<div class="flex items-center justify-between">
				<h2 id="change-cover-heading" class="text-lg font-bold text-ink-900">Ganti Sampul</h2>
				<button type="button" class="btn btn-ghost" aria-label="Tutup" onclick={onclose}><X size={16} /></button>
			</div>
			<div>
				<label class="label" for="cover-file">Gambar sampul</label>
				<input
					id="cover-file"
					type="file"
					accept="image/*"
					class="input"
					onchange={(event) => (file = event.currentTarget.files![0])}
				/>
			</div>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn btn-ghost" onclick={onclose}>Batal</button>
				<button type="submit" class="btn btn-accent" disabled={$coursesStore.isCourseChangeCover}>Unggah</button>
			</div>
		</form>
	</div>
{/if}
