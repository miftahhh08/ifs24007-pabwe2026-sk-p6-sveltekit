<script lang="ts">
	import { onMount } from 'svelte';
	import { BookOpen, GraduationCap, Plus, Search, Star, Trash2, Users } from 'lucide-svelte';
	import { formatRating, notifyResult, showConfirmDialog } from '../../../helpers/toolsHelper';
	import { usersStore } from '../../users/states/usersStore';
	import AddModal from '../modals/AddModal.svelte';
	import {
		coursesStore,
		deleteAllCourses,
		deleteCourse,
		fetchCourses,
		type Course
	} from '../states/coursesStore';

	let onlyMine = $state(false);
	let keyword = $state('');
	let showAdd = $state(false);

	const profileId = $derived($usersStore.profile?.id);
	const visible = $derived(
		$coursesStore.courses.filter((course) =>
			`${course.title} ${course.description} ${course.author.name}`
				.toLowerCase()
				.includes(keyword.trim().toLowerCase())
		)
	);

	const load = () => fetchCourses(onlyMine);

	onMount(() => {
		load();
	});

	async function remove(course: Course) {
		const ok = await showConfirmDialog(
			'Hapus kursus?',
			`Kursus "${course.title}" akan dihapus permanen.`,
			'Hapus'
		);
		if (!ok) return;
		await notifyResult(await deleteCourse(course.id), load);
	}

	async function removeAll() {
		const ok = await showConfirmDialog(
			'Hapus semua kursus saya?',
			'Semua kursus yang kamu buat akan dihapus permanen.',
			'Hapus semua'
		);
		if (!ok) return;
		await notifyResult(await deleteAllCourses(), load);
	}
</script>

<section>
	<header class="mb-6 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-ink-900">{onlyMine ? 'Kursus Saya' : 'Semua Kursus'}</h1>
			<p class="text-sm text-ink-500">Jelajahi kursus, ikuti, atau buat kursus sendiri.</p>
		</div>
		<button type="button" class="btn btn-accent" onclick={() => (showAdd = true)}>
			<Plus size={16} /> Tambah Kursus
		</button>
	</header>

	<div class="mb-6 flex flex-wrap items-center gap-3">
		<div class="relative min-w-60 flex-1">
			<Search size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-500" />
			<input type="search" class="input pl-9" placeholder="Cari kursus…" aria-label="Cari kursus" bind:value={keyword} />
		</div>
		<label class="flex items-center gap-2 text-sm font-medium text-ink-700">
			<input type="checkbox" bind:checked={onlyMine} onchange={load} /> Milik saya
		</label>
		{#if onlyMine && $coursesStore.courses.length > 0}
			<button type="button" class="btn btn-danger" onclick={removeAll}>
				<Trash2 size={16} /> Hapus Semua
			</button>
		{/if}
	</div>

	{#if $coursesStore.isCourse}
		<p class="py-16 text-center text-ink-500">Memuat kursus…</p>
	{:else if visible.length === 0}
		<div class="card flex flex-col items-center gap-2 py-16 text-center">
			<GraduationCap size={36} class="text-gold-500" />
			<p class="font-semibold text-ink-900">Belum ada kursus yang cocok</p>
		</div>
	{:else}
		<ul class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
			{#each visible as course (course.id)}
				<li class="card overflow-hidden">
					<a href={`/courses/${course.id}`} class="block">
						{#if course.cover}
							<img src={course.cover} alt={`Sampul ${course.title}`} class="h-40 w-full object-cover" />
						{:else}
							<div class="flex h-40 items-center justify-center bg-ink-100 text-ink-500">
								<GraduationCap size={40} />
							</div>
						{/if}
						<div class="p-4">
							<h2 class="font-semibold text-ink-900">{course.title}</h2>
							<p class="mt-1 line-clamp-2 text-sm text-ink-500">{course.description}</p>
						</div>
					</a>
					<div class="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
						<span>{course.author.name}</span>
						<span class="flex items-center gap-3">
							<span class="flex items-center gap-1" title="Peserta"><Users size={14} />{course.students.length}</span>
							<span class="flex items-center gap-1" title="Konten"><BookOpen size={14} />{course.total_contents ?? 0}</span>
							<span class="flex items-center gap-1" title="Rating"><Star size={14} />{formatRating(course.avg_ratings)}</span>
						</span>
					</div>
					{#if course.user_id === profileId}
						<div class="px-4 pb-4">
							<button
								type="button"
								class="btn btn-ghost w-full text-red-600"
								aria-label={`Hapus ${course.title}`}
								onclick={() => remove(course)}
							>
								<Trash2 size={14} /> Hapus
							</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<AddModal open={showAdd} onclose={() => (showAdd = false)} onsaved={load} />
