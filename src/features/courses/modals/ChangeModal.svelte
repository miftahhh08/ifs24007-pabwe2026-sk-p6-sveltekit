<script lang="ts">
	import { X } from 'lucide-svelte';
	import { notifyResult, showErrorDialog } from '../../../helpers/toolsHelper';
	import { useInput } from '../../../hooks/useInput';
	import { changeCourse, coursesStore } from '../states/coursesStore';

	let {
		open,
		course,
		onclose,
		onsaved
	}: {
		open: boolean;
		course: { id: number; title: string; description: string };
		onclose: () => void;
		onsaved: () => void;
	} = $props();

	const { value: title } = useInput('');
	const { value: description } = useInput('');

	$effect(() => {
		if (open) {
			title.set(course.title);
			description.set(course.description);
		}
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!$title.trim() || !$description.trim()) {
			await showErrorDialog('Judul dan deskripsi wajib diisi');
			return;
		}
		await notifyResult(await changeCourse(course.id, $title.trim(), $description.trim()), () => {
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
		aria-labelledby="change-course-heading"
	>
		<form class="card w-full max-w-lg space-y-4 p-6" onsubmit={submit} novalidate>
			<div class="flex items-center justify-between">
				<h2 id="change-course-heading" class="text-lg font-bold text-ink-900">Ubah Kursus</h2>
				<button type="button" class="btn btn-ghost" aria-label="Tutup" onclick={onclose}><X size={16} /></button>
			</div>
			<div>
				<label class="label" for="change-course-title">Judul</label>
				<input id="change-course-title" type="text" class="input" bind:value={$title} />
			</div>
			<div>
				<label class="label" for="change-course-description">Deskripsi</label>
				<textarea id="change-course-description" rows="4" class="input" bind:value={$description}></textarea>
			</div>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn btn-ghost" onclick={onclose}>Batal</button>
				<button type="submit" class="btn btn-accent" disabled={$coursesStore.isCourseChange}>Simpan</button>
			</div>
		</form>
	</div>
{/if}
