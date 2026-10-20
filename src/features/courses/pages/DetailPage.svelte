<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ArrowLeft, Camera, Check, GraduationCap, Pencil, Plus, Star, Trash2, Video } from 'lucide-svelte';
	import {
		formatDate,
		formatRating,
		notifyResult,
		showConfirmDialog,
		showErrorDialog
	} from '../../../helpers/toolsHelper';
	import { usersStore } from '../../users/states/usersStore';
	import ChangeCoverModal from '../modals/ChangeCoverModal.svelte';
	import ChangeModal from '../modals/ChangeModal.svelte';
	import ContentModal from '../modals/ContentModal.svelte';
	import {
		changeRating,
		clearCourseDetail,
		coursesStore,
		deleteContent,
		deleteCourse,
		fetchCourse,
		getCourseRole,
		joinCourse,
		leaveCourse,
		type CourseContent
	} from '../states/coursesStore';

	const courseId = $derived(page.params.courseId);
	const course = $derived($coursesStore.course);
	const role = $derived(getCourseRole(course, $usersStore.profile));

	let showChange = $state(false);
	let showCover = $state(false);
	let showContent = $state(false);
	let editing = $state<CourseContent | null>(null);
	let rating = $state(5);
	let comment = $state('');

	const load = () => fetchCourse(courseId);

	onMount(() => {
		clearCourseDetail();
		load();
	});

	function openAddContent() {
		editing = null;
		showContent = true;
	}

	function openEditContent(content: CourseContent) {
		editing = content;
		showContent = true;
	}

	async function removeCourse() {
		const ok = await showConfirmDialog('Hapus kursus?', 'Kursus beserta seluruh kontennya akan dihapus.', 'Hapus');
		if (!ok) return;
		await notifyResult(await deleteCourse(courseId), () => goto('/'));
	}

	async function removeContent(content: CourseContent) {
		const ok = await showConfirmDialog('Hapus konten?', `Konten "${content.title}" akan dihapus.`, 'Hapus');
		if (!ok) return;
		await notifyResult(await deleteContent(content.id), load);
	}

	async function join() {
		await notifyResult(await joinCourse(courseId), load);
	}

	async function leave() {
		const ok = await showConfirmDialog('Keluar dari kursus?', 'Progres belajarmu tidak akan terlihat lagi.', 'Keluar');
		if (!ok) return;
		await notifyResult(await leaveCourse(courseId), load);
	}

	async function submitRating(event: SubmitEvent) {
		event.preventDefault();
		if (!comment.trim()) {
			await showErrorDialog('Komentar rating wajib diisi');
			return;
		}
		await notifyResult(await changeRating(courseId, rating, comment.trim()), load);
	}
</script>

<a href="/" class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-700">
	<ArrowLeft size={16} /> Kembali
</a>

{#if !course}
	{#if $coursesStore.isCourse}
		<p class="py-16 text-center text-ink-500">Memuat kursus…</p>
	{:else}
		<p class="card py-16 text-center text-ink-500">Kursus tidak ditemukan.</p>
	{/if}
{:else}
	<article class="card overflow-hidden">
		{#if course.cover}
			<img src={course.cover} alt={`Sampul ${course.title}`} class="h-56 w-full object-cover" />
		{:else}
			<div class="flex h-56 items-center justify-center bg-ink-100 text-ink-500">
				<GraduationCap size={56} />
			</div>
		{/if}
		<div class="p-6">
			<h1 class="text-2xl font-bold text-ink-900">{course.title}</h1>
			<p class="mt-1 text-sm text-ink-500">
				{`Oleh ${course.author.name}, dibuat ${formatDate(course.created_at)}`}
			</p>
			<p class="mt-4 whitespace-pre-line text-ink-700">{course.description}</p>

			<dl class="mt-5 flex flex-wrap gap-6 text-sm">
				<div><dt class="text-ink-500">Peserta</dt><dd class="font-semibold">{course.students.length}</dd></div>
				<div><dt class="text-ink-500">Konten</dt><dd class="font-semibold">{course.contents.length}</dd></div>
				<div><dt class="text-ink-500">Rating</dt><dd class="font-semibold">{formatRating(course.avg_ratings)}</dd></div>
				{#if role === 'student'}
					<div><dt class="text-ink-500">Progres belajar</dt><dd class="font-semibold">{`${course.my_percentage_finished}%`}</dd></div>
				{/if}
			</dl>

			<div class="mt-6 flex flex-wrap gap-2">
				{#if role === 'owner'}
					<button type="button" class="btn btn-primary" onclick={() => (showChange = true)}><Pencil size={16} /> Ubah Kursus</button>
					<button type="button" class="btn btn-ghost" onclick={() => (showCover = true)}><Camera size={16} /> Ganti Sampul</button>
					<button type="button" class="btn btn-accent" onclick={openAddContent}><Plus size={16} /> Tambah Konten</button>
					<button type="button" class="btn btn-danger" onclick={removeCourse}><Trash2 size={16} /> Hapus Kursus</button>
				{:else if role === 'student'}
					<button type="button" class="btn btn-ghost" onclick={leave}>Keluar dari Kursus</button>
				{:else}
					<button type="button" class="btn btn-accent" onclick={join}>Ikuti Kursus</button>
				{/if}
			</div>
		</div>
	</article>

	<section class="mt-8">
		<h2 class="text-lg font-bold text-ink-900">Konten Kursus</h2>
		{#if course.contents.length === 0}
			<p class="card mt-3 py-8 text-center text-ink-500">Belum ada konten.</p>
		{:else}
			<ul class="mt-3 space-y-2">
				{#each course.contents as content (content.id)}
					<li class="card flex items-center justify-between gap-3 p-4">
						<a href={`/courses/${course.id}/contents/${content.id}`} class="flex min-w-0 items-center gap-3">
							<Video size={18} class="shrink-0 text-gold-500" />
							<span class="truncate font-medium text-ink-900">{content.title}</span>
							{#if content.my_status_finished}
								<span class="flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-ink-900">
									<Check size={12} /> Selesai
								</span>
							{/if}
						</a>
						{#if role === 'owner'}
							<div class="flex gap-2">
								<button type="button" class="btn btn-ghost" aria-label={`Ubah ${content.title}`} onclick={() => openEditContent(content)}><Pencil size={14} /></button>
								<button type="button" class="btn btn-ghost text-red-600" aria-label={`Hapus ${content.title}`} onclick={() => removeContent(content)}><Trash2 size={14} /></button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if role === 'student'}
		<form class="card mt-8 space-y-4 p-6" onsubmit={submitRating} novalidate>
			<h2 class="text-lg font-bold text-ink-900">Beri Rating</h2>
			<div>
				<label class="label" for="rating-value">Rating</label>
				<select id="rating-value" class="input" bind:value={rating}>
					<option value={1}>1</option>
					<option value={2}>2</option>
					<option value={3}>3</option>
					<option value={4}>4</option>
					<option value={5}>5</option>
				</select>
			</div>
			<div>
				<label class="label" for="rating-comment">Komentar</label>
				<textarea id="rating-comment" rows="3" class="input" bind:value={comment}></textarea>
			</div>
			<button type="submit" class="btn btn-primary" disabled={$coursesStore.isRatingChange}>Kirim Rating</button>
		</form>
	{/if}

	<section class="mt-8">
		<h2 class="text-lg font-bold text-ink-900">Rating Peserta</h2>
		{#if course.ratings.length === 0}
			<p class="card mt-3 py-8 text-center text-ink-500">Belum ada rating.</p>
		{:else}
			<ul class="mt-3 space-y-2">
				{#each course.ratings as item, index (index)}
					<li class="card p-4">
						<p class="flex items-center gap-2 font-semibold text-ink-900">
							<span>{item.name}</span>
							<span class="flex items-center gap-1 text-sm text-gold-500"><Star size={14} />{`${item.ratings}/5`}</span>
						</p>
						<p class="mt-1 text-sm text-ink-700">{item.comment}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if role === 'owner'}
		<ChangeModal open={showChange} {course} onclose={() => (showChange = false)} onsaved={load} />
		<ChangeCoverModal open={showCover} courseId={course.id} onclose={() => (showCover = false)} onsaved={load} />
		<ContentModal open={showContent} courseId={course.id} content={editing} onclose={() => (showContent = false)} onsaved={load} />
	{/if}
{/if}
