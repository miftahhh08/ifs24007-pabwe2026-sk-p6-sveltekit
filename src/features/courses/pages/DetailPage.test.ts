import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	failResponse,
	okResponse,
	otherUser,
	sampleDetail,
	sampleUser
} from '../../../test-utils';
import { resetUsersStore, usersStore } from '../../users/states/usersStore';
import type { User } from '../../users/states/usersStore';
import * as courseApi from '../api/courseApi';
import type { CourseDetail } from '../states/coursesStore';
import { coursesStore, resetCoursesStore } from '../states/coursesStore';
import DetailPage from './DetailPage.svelte';

const mocks = vi.hoisted(() => ({
	goto: vi.fn(),
	page: { url: { pathname: '/courses/3' }, params: { courseId: '3' } as Record<string, string> }
}));
vi.mock('$app/navigation', () => ({ goto: mocks.goto }));
vi.mock('$app/state', () => ({ page: mocks.page }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/courseApi');

const setup = (detail: CourseDetail | null, profile: User | null) => {
	resetCoursesStore();
	resetUsersStore();
	usersStore.update((state) => ({ ...state, profile }));
	vi.mocked(courseApi.getCourse).mockResolvedValue(
		detail ? okResponse({ course: detail }) : failResponse('Tidak ada')
	);
	return render(DetailPage);
};

const guestUser: User = { ...otherUser, id: 77 };

describe('DetailPage', () => {
	beforeEach(() => {
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
		vi.mocked(courseApi.getCourse).mockResolvedValue(okResponse({ course: sampleDetail }));
	});

	it('menampilkan status memuat lalu pesan tidak ditemukan', async () => {
		vi.mocked(courseApi.getCourse).mockReturnValue(new Promise(() => {}));
		resetCoursesStore();
		coursesStore.update((state) => ({ ...state, isCourse: true }));
		const { unmount } = render(DetailPage);
		expect(screen.getByText('Memuat kursus…')).toBeInTheDocument();
		unmount();

		setup(null, sampleUser);
		expect(await screen.findByText('Kursus tidak ditemukan.')).toBeInTheDocument();
	});

	it('pemilik: melihat aksi pemilik, konten, dan rating', async () => {
		setup(sampleDetail, sampleUser);
		expect(await screen.findByRole('heading', { name: 'Dasar C' })).toBeInTheDocument();
		expect(screen.getByAltText('Sampul Dasar C')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /ubah kursus/i })).toBeInTheDocument();
		expect(screen.getByText('Pengenalan C')).toBeInTheDocument();
		expect(screen.getByText('Selesai')).toBeInTheDocument();
		expect(screen.getByText('Keren sekali')).toBeInTheDocument();
		expect(screen.queryByText('Progres belajar')).not.toBeInTheDocument();
		expect(courseApi.getCourse).toHaveBeenCalledWith('3');
	});

	it('pemilik yang juga peserta tetap mendapat antarmuka pemilik', async () => {
		setup({ ...sampleDetail, students: [sampleUser.id] }, sampleUser);
		expect(await screen.findByRole('button', { name: /ubah kursus/i })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Keluar dari Kursus' })).not.toBeInTheDocument();
	});

	it('menampilkan placeholder tanpa sampul, tanpa konten, dan tanpa rating', async () => {
		setup({ ...sampleDetail, cover: null, contents: [], ratings: [] }, sampleUser);
		expect(await screen.findByText('Belum ada konten.')).toBeInTheDocument();
		expect(screen.getByText('Belum ada rating.')).toBeInTheDocument();
		expect(screen.queryByAltText('Sampul Dasar C')).not.toBeInTheDocument();
	});

	it('pemilik membuka dan menutup modal ubah, sampul, dan tambah konten', async () => {
		setup(sampleDetail, sampleUser);
		await userEvent.click(await screen.findByRole('button', { name: /ubah kursus/i }));
		expect(screen.getByRole('heading', { name: 'Ubah Kursus' })).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Batal' }));

		await userEvent.click(screen.getByRole('button', { name: /ganti sampul/i }));
		expect(screen.getByRole('heading', { name: 'Ganti Sampul' })).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Batal' }));

		await userEvent.click(screen.getByRole('button', { name: /tambah konten/i }));
		expect(screen.getByRole('heading', { name: 'Tambah Konten' })).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Batal' }));

		await userEvent.click(screen.getByRole('button', { name: 'Ubah Pengenalan C' }));
		expect(screen.getByRole('heading', { name: 'Ubah Konten' })).toBeInTheDocument();
	});

	it('pemilik menghapus kursus lalu kembali ke beranda', async () => {
		vi.mocked(courseApi.deleteCourse).mockResolvedValue(okResponse());
		setup(sampleDetail, sampleUser);
		await userEvent.click(await screen.findByRole('button', { name: /hapus kursus/i }));
		await waitFor(() => expect(mocks.goto).toHaveBeenCalledWith('/'));
		expect(courseApi.deleteCourse).toHaveBeenCalledWith('3');
	});

	it('pemilik membatalkan hapus kursus', async () => {
		setup(sampleDetail, sampleUser);
		const button = await screen.findByRole('button', { name: /hapus kursus/i });
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never);
		await userEvent.click(button);
		await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
		expect(courseApi.deleteCourse).not.toHaveBeenCalled();
	});

	it('pemilik menghapus konten (dikonfirmasi dan dibatalkan)', async () => {
		vi.mocked(courseApi.deleteContent).mockResolvedValue(okResponse());
		setup(sampleDetail, sampleUser);
		const button = await screen.findByRole('button', { name: 'Hapus Pengenalan C' });
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never);
		await userEvent.click(button);
		await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
		expect(courseApi.deleteContent).not.toHaveBeenCalled();

		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
		await userEvent.click(button);
		await waitFor(() => expect(courseApi.deleteContent).toHaveBeenCalledWith(4));
	});

	it('peserta: melihat progres, dapat keluar dari kursus', async () => {
		vi.mocked(courseApi.deleteStudent).mockResolvedValue(okResponse());
		setup(sampleDetail, otherUser);
		expect(await screen.findByText('50.00%')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /ubah kursus/i })).not.toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Keluar dari Kursus' }));
		await waitFor(() => expect(courseApi.deleteStudent).toHaveBeenCalledWith('3'));
	});

	it('peserta membatalkan keluar dari kursus', async () => {
		setup(sampleDetail, otherUser);
		const button = await screen.findByRole('button', { name: 'Keluar dari Kursus' });
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never);
		await userEvent.click(button);
		await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
		expect(courseApi.deleteStudent).not.toHaveBeenCalled();
	});

	it('peserta memberi rating (validasi dan sukses)', async () => {
		vi.mocked(courseApi.putRating).mockResolvedValue(okResponse());
		setup(sampleDetail, otherUser);
		await userEvent.click(await screen.findByRole('button', { name: 'Kirim Rating' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Komentar rating wajib diisi' })
			)
		);
		expect(courseApi.putRating).not.toHaveBeenCalled();

		await userEvent.selectOptions(screen.getByLabelText('Rating'), '4');
		await userEvent.type(screen.getByLabelText('Komentar'), 'Bagus');
		await userEvent.click(screen.getByRole('button', { name: 'Kirim Rating' }));
		await waitFor(() => expect(courseApi.putRating).toHaveBeenCalledWith('3', 4, 'Bagus'));
	});

	it('bukan peserta: dapat mengikuti kursus', async () => {
		vi.mocked(courseApi.postStudent).mockResolvedValue(okResponse());
		setup(sampleDetail, guestUser);
		await userEvent.click(await screen.findByRole('button', { name: 'Ikuti Kursus' }));
		await waitFor(() => expect(courseApi.postStudent).toHaveBeenCalledWith('3'));
		expect(screen.queryByRole('button', { name: 'Kirim Rating' })).not.toBeInTheDocument();
	});

	it('pemilik menyimpan sampul dan konten baru lewat modal', async () => {
		vi.mocked(courseApi.postCover).mockResolvedValue(okResponse());
		vi.mocked(courseApi.postContent).mockResolvedValue(okResponse());
		setup(sampleDetail, sampleUser);

		await userEvent.click(await screen.findByRole('button', { name: /ganti sampul/i }));
		const file = new File(['x'], 'cover.png', { type: 'image/png' });
		await fireEvent.change(screen.getByLabelText('Gambar sampul'), { target: { files: [file] } });
		await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
		await waitFor(() => expect(courseApi.postCover).toHaveBeenCalledWith(sampleDetail.id, file));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

		await userEvent.click(screen.getByRole('button', { name: /tambah konten/i }));
		await userEvent.type(screen.getByLabelText('Judul materi'), 'Materi Baru');
		await userEvent.type(screen.getByLabelText('Tautan YouTube'), 'https://youtu.be/uHyfQV0kbgo');
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() =>
			expect(courseApi.postContent).toHaveBeenCalledWith(
				sampleDetail.id,
				'Materi Baru',
				'https://youtu.be/uHyfQV0kbgo'
			)
		);
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	});
});
