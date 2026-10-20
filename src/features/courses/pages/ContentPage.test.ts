import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse, sampleContent, unfinishedContent } from '../../../test-utils';
import * as courseApi from '../api/courseApi';
import { coursesStore, resetCoursesStore } from '../states/coursesStore';
import ContentPage from './ContentPage.svelte';

const mocks = vi.hoisted(() => ({
	page: {
		url: { pathname: '/courses/3/contents/4' },
		params: { courseId: '3', contentId: '4' } as Record<string, string>
	}
}));
vi.mock('$app/state', () => ({ page: mocks.page }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/courseApi');

describe('ContentPage', () => {
	beforeEach(() => {
		resetCoursesStore();
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
		vi.mocked(courseApi.getContent).mockResolvedValue(okResponse({ course_content: sampleContent }));
	});

	it('menampilkan pemutar YouTube dan tautan kembali', async () => {
		render(ContentPage);
		const frame = await screen.findByTitle('Pengenalan C');
		expect(frame).toHaveAttribute('src', 'https://www.youtube.com/embed/uHyfQV0kbgo');
		expect(screen.getByRole('link', { name: /kembali ke kursus/i })).toHaveAttribute('href', '/courses/3');
		expect(courseApi.getContent).toHaveBeenCalledWith('4');
	});

	it('menampilkan status memuat', () => {
		vi.mocked(courseApi.getContent).mockReturnValue(new Promise(() => {}));
		coursesStore.update((state) => ({ ...state, isContent: true }));
		render(ContentPage);
		expect(screen.getByText('Memuat materi…')).toBeInTheDocument();
	});

	it('menampilkan pesan bila materi tidak ditemukan', async () => {
		vi.mocked(courseApi.getContent).mockResolvedValue(failResponse());
		render(ContentPage);
		expect(await screen.findByText('Materi tidak ditemukan.')).toBeInTheDocument();
	});

	it('menampilkan tautan asli bila URL YouTube tidak valid', async () => {
		vi.mocked(courseApi.getContent).mockResolvedValue(
			okResponse({ course_content: { ...sampleContent, youtube: 'https://contoh.com/x' } })
		);
		render(ContentPage);
		expect(await screen.findByRole('link', { name: 'Buka tautan asli' })).toHaveAttribute(
			'href',
			'https://contoh.com/x'
		);
		expect(screen.queryByTitle('Pengenalan C')).not.toBeInTheDocument();
	});

	it('menandai materi yang selesai menjadi belum selesai', async () => {
		vi.mocked(courseApi.postContentStatus).mockResolvedValue(okResponse());
		render(ContentPage);
		await userEvent.click(await screen.findByRole('button', { name: 'Tandai belum selesai' }));
		await waitFor(() => expect(courseApi.postContentStatus).toHaveBeenCalledWith('4', 0));
		await waitFor(() => expect(courseApi.getContent).toHaveBeenCalledTimes(2));
	});

	it('menandai materi belum selesai menjadi selesai', async () => {
		vi.mocked(courseApi.getContent).mockResolvedValue(okResponse({ course_content: unfinishedContent }));
		vi.mocked(courseApi.postContentStatus).mockResolvedValue(okResponse());
		render(ContentPage);
		await userEvent.click(await screen.findByRole('button', { name: 'Tandai selesai' }));
		await waitFor(() => expect(courseApi.postContentStatus).toHaveBeenCalledWith('4', 1));
	});

	it('menampilkan error bila perubahan status gagal', async () => {
		vi.mocked(courseApi.postContentStatus).mockResolvedValue(failResponse('Bukan peserta'));
		render(ContentPage);
		await userEvent.click(await screen.findByRole('button', { name: 'Tandai belum selesai' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Bukan peserta' }))
		);
		expect(courseApi.getContent).toHaveBeenCalledTimes(1);
	});
});
