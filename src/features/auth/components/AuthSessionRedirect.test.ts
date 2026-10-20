import { render, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { putAccessToken } from '../../../helpers/apiHelper';
import { failResponse, okResponse, sampleUser } from '../../../test-utils';
import * as userApi from '../../users/api/userApi';
import { resetUsersStore, usersStore } from '../../users/states/usersStore';
import { authStore, resetAuthStore } from '../states/authStore';
import AuthSessionRedirect from './AuthSessionRedirect.svelte';

const mocks = vi.hoisted(() => ({
	goto: vi.fn(),
	page: { url: { pathname: '/' }, params: {} as Record<string, string> }
}));
vi.mock('$app/navigation', () => ({ goto: mocks.goto }));
vi.mock('$app/state', () => ({ page: mocks.page }));
vi.mock('../../users/api/userApi');

describe('AuthSessionRedirect', () => {
	beforeEach(() => {
		localStorage.clear();
		resetAuthStore();
		resetUsersStore();
		mocks.page.url.pathname = '/';
	});

	it('mengarahkan ke login bila tidak ada token di rute terproteksi', async () => {
		render(AuthSessionRedirect);
		await waitFor(() => expect(mocks.goto).toHaveBeenCalledWith('/auth/login'));
	});

	it('tidak melakukan apa pun bila tidak ada token di rute /auth', async () => {
		mocks.page.url.pathname = '/auth/login';
		render(AuthSessionRedirect);
		await Promise.resolve();
		expect(mocks.goto).not.toHaveBeenCalled();
	});

	it('memuat profil bila token ada dan tetap di rute terproteksi', async () => {
		putAccessToken('tok');
		vi.mocked(userApi.getProfile).mockResolvedValue(okResponse({ user: sampleUser }));
		render(AuthSessionRedirect);
		await waitFor(() => expect(userApi.getProfile).toHaveBeenCalled());
		await waitFor(() => expect(get(usersStore).profile).toEqual(sampleUser));
		expect(mocks.goto).not.toHaveBeenCalled();
	});

	it('mengarahkan ke beranda saat profil tersedia di rute /auth', async () => {
		mocks.page.url.pathname = '/auth/login';
		putAccessToken('tok');
		vi.mocked(userApi.getProfile).mockResolvedValue(okResponse({ user: sampleUser }));
		render(AuthSessionRedirect);
		await waitFor(() => expect(mocks.goto).toHaveBeenCalledWith('/'));
	});

	it('mengarahkan ke login bila token tidak valid', async () => {
		putAccessToken('tok');
		vi.mocked(userApi.getProfile).mockResolvedValue(failResponse('Unauthenticated.'));
		render(AuthSessionRedirect);
		await waitFor(() => expect(mocks.goto).toHaveBeenCalledWith('/auth/login'));
	});

	it('mengarahkan ke login setelah logout di rute terproteksi', async () => {
		putAccessToken('tok');
		vi.mocked(userApi.getProfile).mockResolvedValue(okResponse({ user: sampleUser }));
		render(AuthSessionRedirect);
		await waitFor(() => expect(userApi.getProfile).toHaveBeenCalled());
		authStore.update((state) => ({ ...state, isAuthLogout: true }));
		await waitFor(() => expect(mocks.goto).toHaveBeenCalledWith('/auth/login'));
	});

	it('tidak mengarahkan ke login saat logout di rute /auth', async () => {
		mocks.page.url.pathname = '/auth/login';
		authStore.update((state) => ({ ...state, isAuthLogout: true }));
		render(AuthSessionRedirect);
		await Promise.resolve();
		expect(mocks.goto).not.toHaveBeenCalled();
	});
});
