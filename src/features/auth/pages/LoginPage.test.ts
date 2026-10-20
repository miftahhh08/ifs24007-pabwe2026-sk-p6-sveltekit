import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse, sampleUser } from '../../../test-utils';
import * as userApi from '../../users/api/userApi';
import { resetUsersStore, usersStore } from '../../users/states/usersStore';
import { get } from 'svelte/store';
import * as authApi from '../api/authApi';
import { resetAuthStore } from '../states/authStore';
import LoginPage from './LoginPage.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/authApi');
vi.mock('../../users/api/userApi');

describe('LoginPage', () => {
	beforeEach(() => {
		localStorage.clear();
		resetAuthStore();
		resetUsersStore();
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
	});

	it('menolak submit bila form kosong', async () => {
		render(LoginPage);
		await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Email dan kata sandi wajib diisi' })
			)
		);
		expect(authApi.login).not.toHaveBeenCalled();
	});

	it('menolak submit bila kata sandi kosong', async () => {
		render(LoginPage);
		await userEvent.type(screen.getByLabelText('Email'), 'a@b.c');
		await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
		await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
		expect(authApi.login).not.toHaveBeenCalled();
	});

	it('login berhasil lalu memuat profil', async () => {
		vi.mocked(authApi.login).mockResolvedValue(okResponse({ user: sampleUser, token: 'tok' }));
		vi.mocked(userApi.getProfile).mockResolvedValue(okResponse({ user: sampleUser }));
		render(LoginPage);
		await userEvent.type(screen.getByLabelText('Email'), 'a@b.c');
		await userEvent.type(screen.getByLabelText('Kata sandi'), 'rahasia');
		await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
		await waitFor(() => expect(get(usersStore).profile).toEqual(sampleUser));
		expect(authApi.login).toHaveBeenCalledWith('a@b.c', 'rahasia');
	});

	it('login gagal menampilkan pesan error', async () => {
		vi.mocked(authApi.login).mockResolvedValue(failResponse('Kredensial akun tidak ditemukan'));
		render(LoginPage);
		await userEvent.type(screen.getByLabelText('Email'), 'a@b.c');
		await userEvent.type(screen.getByLabelText('Kata sandi'), 'salah');
		await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Kredensial akun tidak ditemukan' })
			)
		);
		expect(userApi.getProfile).not.toHaveBeenCalled();
	});

	it('menyediakan tautan ke halaman daftar', () => {
		render(LoginPage);
		expect(screen.getByRole('link', { name: 'Daftar' })).toHaveAttribute('href', '/auth/register');
	});
});
