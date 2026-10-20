import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse, sampleCourse } from '../../../test-utils';
import * as courseApi from '../api/courseApi';
import { resetCoursesStore } from '../states/coursesStore';
import ChangeModal from './ChangeModal.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/courseApi');

const setup = (open = true) => {
	const onclose = vi.fn();
	const onsaved = vi.fn();
	render(ChangeModal, { props: { open, course: sampleCourse, onclose, onsaved } });
	return { onclose, onsaved };
};

describe('ChangeModal', () => {
	beforeEach(() => {
		resetCoursesStore();
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
	});

	it('tidak merender apa pun saat tertutup', () => {
		setup(false);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('mengisi form dengan data kursus saat terbuka', async () => {
		setup();
		await waitFor(() => expect(screen.getByLabelText('Judul')).toHaveValue('Dasar C'));
		expect(screen.getByLabelText('Deskripsi')).toHaveValue('Belajar dasar C dari awal');
	});

	it('menolak bila judul dikosongkan', async () => {
		setup();
		await waitFor(() => expect(screen.getByLabelText('Judul')).toHaveValue('Dasar C'));
		await userEvent.clear(screen.getByLabelText('Judul'));
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Judul dan deskripsi wajib diisi' })
			)
		);
		expect(courseApi.putCourse).not.toHaveBeenCalled();
	});

	it('menyimpan perubahan lalu menutup modal', async () => {
		vi.mocked(courseApi.putCourse).mockResolvedValue(okResponse());
		const { onclose, onsaved } = setup();
		await waitFor(() => expect(screen.getByLabelText('Judul')).toHaveValue('Dasar C'));
		await userEvent.type(screen.getByLabelText('Judul'), ' Lanjut');
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() => expect(onsaved).toHaveBeenCalledOnce());
		expect(courseApi.putCourse).toHaveBeenCalledWith(3, 'Dasar C Lanjut', 'Belajar dasar C dari awal');
		expect(onclose).toHaveBeenCalledOnce();
	});

	it('menampilkan error bila gagal', async () => {
		vi.mocked(courseApi.putCourse).mockResolvedValue(failResponse('Tidak boleh'));
		const { onclose } = setup();
		await waitFor(() => expect(screen.getByLabelText('Judul')).toHaveValue('Dasar C'));
		await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Tidak boleh' }))
		);
		expect(onclose).not.toHaveBeenCalled();
	});

	it('tombol Batal dan Tutup memanggil onclose', async () => {
		const { onclose } = setup();
		await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
		await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
		expect(onclose).toHaveBeenCalledTimes(2);
	});
});
