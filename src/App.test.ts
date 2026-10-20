import { render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { putAccessToken } from './helpers/apiHelper';
import { childSnippet, okResponse, sampleUser } from './test-utils';
import { resetAuthStore } from './features/auth/states/authStore';
import * as userApi from './features/users/api/userApi';
import { resetUsersStore } from './features/users/states/usersStore';
import RootLayout from './routes/+layout.svelte';

const mocks = vi.hoisted(() => ({
	goto: vi.fn(),
	page: { url: { pathname: '/' }, params: {} as Record<string, string> }
}));
vi.mock('$app/navigation', () => ({ goto: mocks.goto }));
vi.mock('$app/state', () => ({ page: mocks.page }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('./features/users/api/userApi');

describe('App (integrasi layout)', () => {
	beforeEach(() => {
		localStorage.clear();
		resetAuthStore();
		resetUsersStore();
		mocks.page.url.pathname = '/';
		vi.stubEnv('VITE_DELCOM_BASEURL', 'https://api.test/api/v1');
	});

	it('menampilkan navbar, sidebar, dan konten untuk pengguna yang login', async () => {
		putAccessToken('tok');
		vi.mocked(userApi.getProfile).mockResolvedValue(okResponse({ user: sampleUser }));
		render(RootLayout, { props: { children: childSnippet() } });
		expect(await screen.findByText('Ifs Tester')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Semua Kursus' })).toBeInTheDocument();
		expect(screen.getByText('isi anak')).toBeInTheDocument();
		expect(mocks.goto).not.toHaveBeenCalled();
	});

	it('mengarahkan tamu ke halaman login', async () => {
		render(RootLayout, { props: { children: childSnippet() } });
		await waitFor(() => expect(mocks.goto).toHaveBeenCalledWith('/auth/login'));
	});

	it('halaman /auth tampil tanpa navbar dan sidebar kursus', () => {
		mocks.page.url.pathname = '/auth/login';
		render(RootLayout, { props: { children: childSnippet() } });
		expect(screen.getByText('isi anak')).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Semua Kursus' })).not.toBeInTheDocument();
	});
});
