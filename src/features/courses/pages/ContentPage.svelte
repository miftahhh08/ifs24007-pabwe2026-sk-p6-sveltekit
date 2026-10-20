<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { ArrowLeft, Check } from 'lucide-svelte';
	import { getErrorMessage, isSuccess } from '../../../helpers/apiHelper';
	import { getYoutubeEmbedUrl, showErrorDialog } from '../../../helpers/toolsHelper';
	import { changeContentStatus, coursesStore, fetchContent } from '../states/coursesStore';

	const courseId = $derived(page.params.courseId);
	const contentId = $derived(page.params.contentId);
	const content = $derived($coursesStore.content);
	// Hanya dibaca di dalam blok {:else} saat `content` sudah ada.
	const embedUrl = $derived(getYoutubeEmbedUrl(content!.youtube));

	onMount(() => {
		fetchContent(contentId);
	});

	async function toggleStatus() {
		const response = await changeContentStatus(contentId, content!.my_status_finished ? 0 : 1);
		if (isSuccess(response)) {
			await fetchContent(contentId);
		} else {
			await showErrorDialog(getErrorMessage(response));
		}
	}
</script>

<a href={`/courses/${courseId}`} class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-700">
	<ArrowLeft size={16} /> Kembali ke kursus
</a>

{#if !content}
	{#if $coursesStore.isContent}
		<p class="py-16 text-center text-ink-500">Memuat materi…</p>
	{:else}
		<p class="card py-16 text-center text-ink-500">Materi tidak ditemukan.</p>
	{/if}
{:else}
	<article class="space-y-5">
		<h1 class="text-2xl font-bold text-ink-900">{content.title}</h1>

		{#if embedUrl}
			<div class="card aspect-video overflow-hidden">
				<iframe
					src={embedUrl}
					title={content.title}
					class="size-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
		{:else}
			<p class="card p-6 text-ink-700">
				Tautan video tidak dapat ditampilkan.
				<a href={content.youtube} class="font-semibold underline" target="_blank" rel="noreferrer">Buka tautan asli</a>
			</p>
		{/if}

		<button type="button" class={['btn', content.my_status_finished ? 'btn-ghost' : 'btn-primary']} onclick={toggleStatus}>
			<Check size={16} />
			{content.my_status_finished ? 'Tandai belum selesai' : 'Tandai selesai'}
		</button>
	</article>
{/if}
