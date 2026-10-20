<script lang="ts">
	import { X } from 'lucide-svelte';
	import { notifyResult, showErrorDialog } from '../../../helpers/toolsHelper';
	import { useInput } from '../../../hooks/useInput';
	import { addCourse, coursesStore } from '../states/coursesStore';

	let {
		open,
		onclose,
		onsaved
	}: { open: boolean; onclose: () => void; onsaved: () => void } = $props();

	const { value: title, reset: resetTitle } = useInput('');
	const { value: description, reset: resetDescription } = useInput('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!$title.trim() || !$description.trim()) {
			await showErrorDialog('Judul dan deskripsi wajib diisi');
			return;
		}
		await notifyResult(await addCourse($title.trim(), $description.trim()), () => {
			resetTitle();
			resetDescription();
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
		aria-labelledby="add-course-heading"
	>
		<form class="card w-full max-w-lg space-y-4 p-6" onsubmit={submit} novalidate>
			<div class="flex items-center justify-between">
				<h2 id="add-course-heading" class="text-lg font-bold text-ink-900">Tambah Kursus</h2>
				<button type="button" class="btn btn-ghost" aria-label="Tutup" onclick={onclose}><X size={16} /></button>
			</div>
			<div>
				<label class="label" for="add-course-title">Judul</label>
				<input id="add-course-title" type="text" class="input" placeholder="Mis. Belajar ReactJS" bind:value={$title} />
			</div>
			<div>
				<label class="label" for="add-course-description">Deskripsi</label>
				<textarea id="add-course-description" rows="4" class="input" placeholder="Apa yang akan dipelajari?" bind:value={$description}></textarea>
			</div>
			<p class="text-xs text-ink-500">Sampul kursus bisa diunggah dari halaman detail setelah kursus dibuat.</p>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn btn-ghost" onclick={onclose}>Batal</button>
				<button type="submit" class="btn btn-accent" disabled={$coursesStore.isCourseAdd}>Simpan</button>
			</div>
		</form>
	</div>
{/if}
