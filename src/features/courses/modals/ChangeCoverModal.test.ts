import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse } from '../../../test-utils';
import * as courseApi from '../api/courseApi';
import { resetCoursesStore } from '../states/coursesStore';
import ChangeCoverModal from './ChangeCoverModal.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/courseApi');

const setup = (open = true) => {
	const onclose = vi.fn();
	const onsaved = vi.fn();
	render(ChangeCoverModal, { props: { open, courseId: 3, onclose, onsaved } });
	return { onclose, onsaved };
};

const pick = (file: File) =>
	fireEvent.change(screen.getByLabelText('Gambar sampul'), { target: { files: [file] } });

describe('ChangeCoverModal', () => {
	beforeEach(() => {
		resetCoursesStore();
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
	});

	it('tidak merender apa pun saat tertutup', () => {
		setup(false);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('menolak bila belum memilih berkas', async () => {
		setup();
		await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Pilih gambar sampul terlebih dahulu' })
			)
		);
		expect(courseApi.postCover).not.toHaveBeenCalled();
	});

	it('menolak berkas yang bukan gambar', async () => {
		setup();
		await pick(new File(['x'], 'dokumen.pdf', { type: 'application/pdf' }));
		await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Berkas sampul harus berupa gambar' })
			)
		);
		expect(courseApi.postCover).not.toHaveBeenCalled();
	});

	it('mengunggah sampul lalu menutup modal', async () => {
		vi.mocked(courseApi.postCover).mockResolvedValue(okResponse());
		const { onclose, onsaved } = setup();
		const file = new File(['x'], 'cover.png', { type: 'image/png' });
		await pick(file);
		await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
		await waitFor(() => expect(onsaved).toHaveBeenCalledOnce());
		expect(courseApi.postCover).toHaveBeenCalledWith(3, file);
		expect(onclose).toHaveBeenCalledOnce();
	});

	it('menampilkan error bila unggah gagal', async () => {
		vi.mocked(courseApi.postCover).mockResolvedValue(failResponse('Ukuran terlalu besar'));
		const { onclose } = setup();
		await pick(new File(['x'], 'cover.png', { type: 'image/png' }));
		await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Ukuran terlalu besar' }))
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
