import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse } from '../../../test-utils';
import * as authApi from '../api/authApi';
import { resetAuthStore } from '../states/authStore';
import RegisterPage from './RegisterPage.svelte';

const mocks = vi.hoisted(() => ({ goto: vi.fn() }));
vi.mock('$app/navigation', () => ({ goto: mocks.goto }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/authApi');

const fill = async (name: string, email: string, password: string) => {
	if (name) await userEvent.type(screen.getByLabelText('Nama'), name);
	if (email) await userEvent.type(screen.getByLabelText('Email'), email);
	if (password) await userEvent.type(screen.getByLabelText('Kata sandi'), password);
	await userEvent.click(screen.getByRole('button', { name: 'Daftar' }));
};

describe('RegisterPage', () => {
	beforeEach(() => {
		resetAuthStore();
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
	});

	it('menolak form yang belum lengkap', async () => {
		render(RegisterPage);
		await fill('', '', '');
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Nama, email, dan kata sandi wajib diisi' })
			)
		);
		expect(authApi.register).not.toHaveBeenCalled();
	});

	it('menolak kata sandi kurang dari 6 karakter', async () => {
		render(RegisterPage);
		await fill('Nama', 'a@b.c', '123');
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Kata sandi minimal 6 karakter' })
			)
		);
		expect(authApi.register).not.toHaveBeenCalled();
	});

	it('mendaftar lalu mengarahkan ke halaman login', async () => {
		vi.mocked(authApi.register).mockResolvedValue(okResponse(undefined, 'Berhasil mendaftar'));
		render(RegisterPage);
		await fill('Nama', 'a@b.c', 'rahasia');
		await waitFor(() => expect(mocks.goto).toHaveBeenCalledWith('/auth/login'));
		expect(authApi.register).toHaveBeenCalledWith('Nama', 'a@b.c', 'rahasia');
		expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Berhasil mendaftar' }));
	});

	it('menampilkan error saat pendaftaran gagal', async () => {
		vi.mocked(authApi.register).mockResolvedValue(failResponse('Email sudah dipakai'));
		render(RegisterPage);
		await fill('Nama', 'a@b.c', 'rahasia');
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Email sudah dipakai' }))
		);
		expect(mocks.goto).not.toHaveBeenCalled();
	});

	it('menyediakan tautan ke halaman masuk', () => {
		render(RegisterPage);
		expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/auth/login');
	});
});
