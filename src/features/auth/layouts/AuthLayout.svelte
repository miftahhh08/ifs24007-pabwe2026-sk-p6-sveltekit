<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BookOpen, GraduationCap, Video } from 'lucide-svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
	<aside class="hidden flex-col justify-between bg-ink-900 p-12 text-white lg:flex">
		<div class="flex items-center gap-3">
			<span class="flex size-11 items-center justify-center rounded-xl bg-gold-500 text-ink-900">
				<GraduationCap size={26} />
			</span>
			<span class="text-xl font-extrabold tracking-tight">Delcom Courses</span>
		</div>

		<div class="max-w-md">
			<h1 class="text-4xl leading-tight font-extrabold">
				Kursus video yang bisa kamu ikuti, atau kamu ajarkan.
			</h1>
			<p class="mt-5 text-lg leading-relaxed text-ink-200">
				Pengajar menyusun materi dari video YouTube, pelajar mengikuti kursus, menandai materi yang
				sudah selesai, lalu memberi rating untuk kursusnya.
			</p>
		</div>

		<ul class="space-y-3 text-sm text-ink-200">
			<li class="flex items-center gap-3"><Video size={18} class="text-gold-400" /> Materi berupa tautan video YouTube</li>
			<li class="flex items-center gap-3"><BookOpen size={18} class="text-gold-400" /> Progres belajar tercatat per pelajar</li>
		</ul>
	</aside>

	<main class="flex items-center justify-center bg-ink-50 p-6 sm:p-12">
		<div class="w-full max-w-md">
			<div class="mb-8 flex items-center gap-2 text-ink-900 lg:hidden">
				<GraduationCap size={24} />
				<span class="text-lg font-extrabold">Delcom Courses</span>
			</div>
			{@render children()}
		</div>
	</main>
</div>
