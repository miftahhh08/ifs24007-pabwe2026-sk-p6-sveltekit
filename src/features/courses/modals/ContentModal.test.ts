import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse, sampleContent } from '../../../test-utils';
import * as courseApi from '../api/courseApi';
import type { CourseContent } from '../states/coursesStore';
import { resetCoursesStore } from '../states/coursesStore';
import ContentModal from './ContentModal.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/courseApi');

const setup = (props: { open?: boolean; content?: CourseContent | null } = {}) => {
	const onclose = vi.fn();
	const onsaved = vi.fn();
	render(ContentModal, { props: { open: true, courseId: 3, onclose, onsaved, ...props } });
	return { onclose, onsaved };
};

const dialogText = (text: string) => expect.objectContaining({ text });

describe('ContentModal', () => {
	beforeEach(() => {
		resetCoursesStore();
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
	});

	it('tidak merender apa pun saat tertutup', () => {
		setup({ open: false });
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('mode tambah: form kosong dan judul Tambah Konten', () => {
		setup();
		expect(screen.getByRole('heading', { name: 'Tambah Konten' })).toBeInTheDocument();
		expect(screen.getByLabelText('Judul materi')).toHaveValue('');
	});

	it('menolak bila judul atau tautan kosong', async () => {
		setup();
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(dialogText('Judul dan tautan YouTube wajib diisi'))
		);
	});

	it('menolak tautan yang bukan YouTube', async () => {
		setup();
		await userEvent.type(screen.getByLabelText('Judul materi'), 'Materi');
		await userEvent.type(screen.getByLabelText('Tautan YouTube'), 'https://contoh.com/video');
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(dialogText('Tautan YouTube tidak valid')));
		expect(courseApi.postContent).not.toHaveBeenCalled();
	});

	it('mode tambah: menyimpan konten baru', async () => {
		vi.mocked(courseApi.postContent).mockResolvedValue(okResponse());
		const { onclose, onsaved } = setup();
		await userEvent.type(screen.getByLabelText('Judul materi'), 'Materi 1');
		await userEvent.type(screen.getByLabelText('Tautan YouTube'), 'https://youtu.be/uHyfQV0kbgo');
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() => expect(onsaved).toHaveBeenCalledOnce());
		expect(courseApi.postContent).toHaveBeenCalledWith(3, 'Materi 1', 'https://youtu.be/uHyfQV0kbgo');
		expect(onclose).toHaveBeenCalledOnce();
	});

	it('mode ubah: mengisi form dan memanggil changeContent', async () => {
		vi.mocked(courseApi.putContent).mockResolvedValue(okResponse());
		const { onsaved } = setup({ content: sampleContent });
		expect(screen.getByRole('heading', { name: 'Ubah Konten' })).toBeInTheDocument();
		await waitFor(() => expect(screen.getByLabelText('Judul materi')).toHaveValue('Pengenalan C'));
		expect(screen.getByLabelText('Tautan YouTube')).toHaveValue('https://youtu.be/uHyfQV0kbgo');
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() => expect(onsaved).toHaveBeenCalledOnce());
		expect(courseApi.putContent).toHaveBeenCalledWith(4, 'Pengenalan C', 'https://youtu.be/uHyfQV0kbgo');
		expect(courseApi.postContent).not.toHaveBeenCalled();
	});

	it('menampilkan error dan tidak menutup bila gagal', async () => {
		vi.mocked(courseApi.putContent).mockResolvedValue(failResponse('Ditolak'));
		const { onclose } = setup({ content: sampleContent });
		await waitFor(() => expect(screen.getByLabelText('Judul materi')).toHaveValue('Pengenalan C'));
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(dialogText('Ditolak')));
		expect(onclose).not.toHaveBeenCalled();
	});

	it('tombol Batal dan Tutup memanggil onclose', async () => {
		const { onclose } = setup();
		await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
		await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
		expect(onclose).toHaveBeenCalledTimes(2);
	});
});
