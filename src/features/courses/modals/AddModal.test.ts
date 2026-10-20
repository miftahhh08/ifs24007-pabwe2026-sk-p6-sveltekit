import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse } from '../../../test-utils';
import * as courseApi from '../api/courseApi';
import { resetCoursesStore } from '../states/coursesStore';
import AddModal from './AddModal.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/courseApi');

const setup = (open = true) => {
	const onclose = vi.fn();
	const onsaved = vi.fn();
	render(AddModal, { props: { open, onclose, onsaved } });
	return { onclose, onsaved };
};

describe('AddModal', () => {
	beforeEach(() => {
		resetCoursesStore();
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
	});

	it('tidak merender apa pun saat tertutup', () => {
		setup(false);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('menolak form kosong', async () => {
		setup();
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Judul dan deskripsi wajib diisi' })
			)
		);
		expect(courseApi.postCourse).not.toHaveBeenCalled();
	});

	it('menyimpan kursus lalu menutup modal dan memberi tahu induk', async () => {
		vi.mocked(courseApi.postCourse).mockResolvedValue(okResponse());
		const { onclose, onsaved } = setup();
		await userEvent.type(screen.getByLabelText('Judul'), 'Belajar React');
		await userEvent.type(screen.getByLabelText('Deskripsi'), 'Dari dasar');
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() => expect(onsaved).toHaveBeenCalledOnce());
		expect(courseApi.postCourse).toHaveBeenCalledWith('Belajar React', 'Dari dasar');
		expect(onclose).toHaveBeenCalledOnce();
		expect(screen.getByLabelText('Judul')).toHaveValue('');
	});

	it('menampilkan error dan tidak menutup modal bila gagal', async () => {
		vi.mocked(courseApi.postCourse).mockResolvedValue(failResponse('Judul sudah ada'));
		const { onclose, onsaved } = setup();
		await userEvent.type(screen.getByLabelText('Judul'), 'A');
		await userEvent.type(screen.getByLabelText('Deskripsi'), 'B');
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Judul sudah ada' }))
		);
		expect(onclose).not.toHaveBeenCalled();
		expect(onsaved).not.toHaveBeenCalled();
	});

	it('tombol Batal dan Tutup memanggil onclose', async () => {
		const { onclose } = setup();
		await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
		await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
		expect(onclose).toHaveBeenCalledTimes(2);
	});
});
