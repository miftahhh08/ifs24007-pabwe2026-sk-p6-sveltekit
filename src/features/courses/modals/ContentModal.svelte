<script lang="ts">
	import { X } from 'lucide-svelte';
	import { getYoutubeEmbedUrl, notifyResult, showErrorDialog } from '../../../helpers/toolsHelper';
	import { useInput } from '../../../hooks/useInput';
	import {
		addContent,
		changeContent,
		coursesStore,
		type CourseContent
	} from '../states/coursesStore';

	let {
		open,
		courseId,
		content = null,
		onclose,
		onsaved
	}: {
		open: boolean;
		courseId: number | string;
		content?: CourseContent | null;
		onclose: () => void;
		onsaved: () => void;
	} = $props();

	const { value: title, reset: resetTitle } = useInput('');
	const { value: youtube, reset: resetYoutube } = useInput('');

	$effect(() => {
		if (open) {
			title.set(content?.title ?? '');
			youtube.set(content?.youtube ?? '');
		}
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!$title.trim() || !$youtube.trim()) {
			await showErrorDialog('Judul dan tautan YouTube wajib diisi');
			return;
		}
		if (!getYoutubeEmbedUrl($youtube.trim())) {
			await showErrorDialog('Tautan YouTube tidak valid');
			return;
		}
		const response = content
			? await changeContent(content.id, $title.trim(), $youtube.trim())
			: await addContent(courseId, $title.trim(), $youtube.trim());
		await notifyResult(response, () => {
			resetTitle();
			resetYoutube();
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
		aria-labelledby="content-heading"
	>
		<form class="card w-full max-w-lg space-y-4 p-6" onsubmit={submit} novalidate>
			<div class="flex items-center justify-between">
				<h2 id="content-heading" class="text-lg font-bold text-ink-900">
					{content ? 'Ubah Konten' : 'Tambah Konten'}
				</h2>
				<button type="button" class="btn btn-ghost" aria-label="Tutup" onclick={onclose}><X size={16} /></button>
			</div>
			<div>
				<label class="label" for="content-title">Judul materi</label>
				<input id="content-title" type="text" class="input" bind:value={$title} />
			</div>
			<div>
				<label class="label" for="content-youtube">Tautan YouTube</label>
				<input id="content-youtube" type="url" class="input" placeholder="https://youtu.be/..." bind:value={$youtube} />
			</div>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn btn-ghost" onclick={onclose}>Batal</button>
				<button
					type="submit"
					class="btn btn-accent"
					disabled={$coursesStore.isContentAdd || $coursesStore.isContentChange}>Simpan</button
				>
			</div>
		</form>
	</div>
{/if}
