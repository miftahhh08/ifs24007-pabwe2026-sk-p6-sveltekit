import { render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse, otherUser, sampleUser } from '../../../test-utils';
import * as userApi from '../api/userApi';
import { resetUsersStore } from '../states/usersStore';
import UsersPage from './UsersPage.svelte';

vi.mock('../api/userApi');

describe('UsersPage', () => {
	beforeEach(() => {
		resetUsersStore();
		vi.stubEnv('VITE_DELCOM_BASEURL', 'https://api.test/api/v1');
	});

	it('menampilkan daftar pengguna', async () => {
		vi.mocked(userApi.getUsers).mockResolvedValue(okResponse({ users: [sampleUser, otherUser] }));
		render(UsersPage);
		expect(await screen.findByText('Ifs Tester')).toBeInTheDocument();
		expect(screen.getByText('budi@delcom.org')).toBeInTheDocument();
		expect(screen.getByAltText('Foto Budi')).toHaveAttribute(
			'src',
			'https://api.test/default/img/user.png'
		);
	});

	it('menampilkan status memuat', () => {
		vi.mocked(userApi.getUsers).mockReturnValue(new Promise(() => {}));
		render(UsersPage);
		expect(screen.getByText('Memuat pengguna…')).toBeInTheDocument();
	});

	it('menampilkan keadaan kosong saat gagal memuat', async () => {
		vi.mocked(userApi.getUsers).mockResolvedValue(failResponse());
		render(UsersPage);
		await waitFor(() => expect(screen.getByText('Belum ada pengguna.')).toBeInTheDocument());
	});
});
