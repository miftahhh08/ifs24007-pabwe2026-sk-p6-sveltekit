import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse, sampleUser } from '../../../test-utils';
import * as userApi from '../api/userApi';
import { resetUsersStore, usersStore } from '../states/usersStore';
import ProfilePage from './ProfilePage.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/userApi');

const dialogText = (text: string) => expect.objectContaining({ text });

describe('ProfilePage', () => {
	beforeEach(() => {
		resetUsersStore();
		vi.stubEnv('VITE_DELCOM_BASEURL', 'https://api.test/api/v1');
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
		usersStore.update((state) => ({ ...state, profile: sampleUser }));
	});

	it('menampilkan profil dan mengisi form dengan data saat ini', async () => {
		render(ProfilePage);
		expect(screen.getByText('Ifs Tester', { selector: 'p' })).toBeInTheDocument();
		await waitFor(() => expect(screen.getByLabelText('Nama')).toHaveValue('Ifs Tester'));
		expect(screen.getByLabelText('Email')).toHaveValue('ifs24007@delcom.org');
		expect(screen.getByAltText('Foto profil')).toHaveAttribute(
			'src',
			'https://api.test/img/profile/1.png'
		);
	});

	it('tidak menampilkan kartu profil saat profil belum tersedia', () => {
		resetUsersStore();
		render(ProfilePage);
		expect(screen.queryByAltText('Foto profil')).not.toBeInTheDocument();
	});

	it('menolak simpan data bila nama kosong', async () => {
		render(ProfilePage);
		await userEvent.clear(screen.getByLabelText('Nama'));
		await userEvent.click(screen.getByRole('button', { name: 'Simpan data' }));
		await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(dialogText('Nama dan email wajib diisi')));
		expect(userApi.putProfile).not.toHaveBeenCalled();
	});

	it('menyimpan data akun', async () => {
		vi.mocked(userApi.putProfile).mockResolvedValue(
			okResponse({ user: { ...sampleUser, name: 'Baru' } }, 'Berhasil mengubah data')
		);
		render(ProfilePage);
		await userEvent.clear(screen.getByLabelText('Nama'));
		await userEvent.type(screen.getByLabelText('Nama'), 'Baru');
		await userEvent.click(screen.getByRole('button', { name: 'Simpan data' }));
		await waitFor(() => expect(userApi.putProfile).toHaveBeenCalledWith('Baru', sampleUser.email));
	});

	it('menolak unggah foto bila belum memilih berkas', async () => {
		render(ProfilePage);
		await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
		await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(dialogText('Pilih foto terlebih dahulu')));
		expect(userApi.postPhoto).not.toHaveBeenCalled();
	});

	it('mengunggah foto', async () => {
		vi.mocked(userApi.postPhoto).mockResolvedValue(okResponse());
		vi.mocked(userApi.getProfile).mockResolvedValue(okResponse({ user: sampleUser }));
		render(ProfilePage);
		const file = new File(['x'], 'foto.png', { type: 'image/png' });
		await fireEvent.change(screen.getByLabelText('Berkas foto'), { target: { files: [file] } });
		await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
		await waitFor(() => expect(userApi.postPhoto).toHaveBeenCalledWith(file));
	});

	it('menolak ganti kata sandi bila kolom kosong', async () => {
		render(ProfilePage);
		await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(dialogText('Semua kolom kata sandi wajib diisi'))
		);
	});

	it('menolak ganti kata sandi bila konfirmasi tidak sama', async () => {
		render(ProfilePage);
		await userEvent.type(screen.getByLabelText('Kata sandi lama'), 'lama123');
		await userEvent.type(screen.getByLabelText('Kata sandi baru'), 'baru123');
		await userEvent.type(screen.getByLabelText('Konfirmasi kata sandi baru'), 'beda123');
		await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(dialogText('Konfirmasi kata sandi baru tidak sama'))
		);
		expect(userApi.putPassword).not.toHaveBeenCalled();
	});

	it('mengganti kata sandi lalu mengosongkan kolom', async () => {
		vi.mocked(userApi.putPassword).mockResolvedValue(okResponse());
		render(ProfilePage);
		await userEvent.type(screen.getByLabelText('Kata sandi lama'), 'lama123');
		await userEvent.type(screen.getByLabelText('Kata sandi baru'), 'baru123');
		await userEvent.type(screen.getByLabelText('Konfirmasi kata sandi baru'), 'baru123');
		await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
		await waitFor(() => expect(userApi.putPassword).toHaveBeenCalledWith('lama123', 'baru123', 'baru123'));
		await waitFor(() => expect(screen.getByLabelText('Kata sandi lama')).toHaveValue(''));
	});

	it('menampilkan error saat ganti kata sandi gagal', async () => {
		vi.mocked(userApi.putPassword).mockResolvedValue(failResponse('Kata sandi lama salah'));
		render(ProfilePage);
		await userEvent.type(screen.getByLabelText('Kata sandi lama'), 'x');
		await userEvent.type(screen.getByLabelText('Kata sandi baru'), 'baru123');
		await userEvent.type(screen.getByLabelText('Konfirmasi kata sandi baru'), 'baru123');
		await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
		await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(dialogText('Kata sandi lama salah')));
		expect(screen.getByLabelText('Kata sandi lama')).toHaveValue('x');
	});
});
