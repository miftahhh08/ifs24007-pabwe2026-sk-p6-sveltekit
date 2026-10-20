import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper';
import { failResponse, okResponse, sampleUser } from '../../../test-utils';
import { usersStore } from '../../users/states/usersStore';
import * as authApi from '../api/authApi';
import { authStore, login, logout, register, resetAuthStore } from './authStore';

vi.mock('../api/authApi');

describe('authStore', () => {
	beforeEach(() => {
		localStorage.clear();
		resetAuthStore();
	});

	it('login sukses menyimpan token', async () => {
		vi.mocked(authApi.login).mockResolvedValue(
			okResponse({ user: sampleUser, token: 'tok' }, 'Berhasil login')
		);
		expect(await login('a@b.c', 'rahasia')).toBe(true);
		expect(getAccessToken()).toBe('tok');
		expect(get(authStore)).toMatchObject({ isAuthLogin: true, message: 'Berhasil login' });
	});

	it('login gagal menyimpan pesan error', async () => {
		vi.mocked(authApi.login).mockResolvedValue(failResponse('Kredensial akun tidak ditemukan'));
		expect(await login('a@b.c', 'salah')).toBe(false);
		expect(getAccessToken()).toBeNull();
		expect(get(authStore)).toMatchObject({
			isAuthLogin: false,
			message: 'Kredensial akun tidak ditemukan'
		});
	});

	it('register sukses', async () => {
		vi.mocked(authApi.register).mockResolvedValue(okResponse(undefined, 'Berhasil mendaftar'));
		expect(await register('Nama', 'a@b.c', 'rahasia')).toBe(true);
		expect(get(authStore)).toMatchObject({ isAuthRegister: true, message: 'Berhasil mendaftar' });
	});

	it('register gagal', async () => {
		vi.mocked(authApi.register).mockResolvedValue(failResponse('Email sudah dipakai'));
		expect(await register('Nama', 'a@b.c', 'rahasia')).toBe(false);
		expect(get(authStore)).toMatchObject({ isAuthRegister: false, message: 'Email sudah dipakai' });
	});

	it('logout menghapus token dan profil', async () => {
		putAccessToken('tok');
		usersStore.update((state) => ({ ...state, profile: sampleUser }));
		vi.mocked(authApi.logout).mockResolvedValue(okResponse());
		await logout();
		expect(getAccessToken()).toBeNull();
		expect(get(usersStore).profile).toBeNull();
		expect(get(authStore).isAuthLogout).toBe(true);
	});
});
