import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { okResponse, sampleUser } from '../../../test-utils';
import * as authApi from '../../auth/api/authApi';
import { resetAuthStore } from '../../auth/states/authStore';
import { resetUsersStore, usersStore } from '../../users/states/usersStore';
import NavbarComponent from './NavbarComponent.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../../auth/api/authApi');

describe('NavbarComponent', () => {
	beforeEach(() => {
		resetAuthStore();
		resetUsersStore();
		vi.stubEnv('VITE_DELCOM_BASEURL', 'https://api.test/api/v1');
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
		vi.mocked(authApi.logout).mockResolvedValue(okResponse());
	});

	it('menampilkan nama dan email pengguna aktif', () => {
		usersStore.update((state) => ({ ...state, profile: sampleUser }));
		render(NavbarComponent, { props: { onmenu: vi.fn() } });
		expect(screen.getByText('Ifs Tester')).toBeInTheDocument();
		expect(screen.getByText('ifs24007@delcom.org')).toBeInTheDocument();
		expect(screen.getByText('Delcom Courses')).toBeInTheDocument();
	});

	it('tidak menampilkan identitas bila profil belum ada', () => {
		render(NavbarComponent, { props: { onmenu: vi.fn() } });
		expect(screen.queryByText('Ifs Tester')).not.toBeInTheDocument();
	});

	it('memanggil onmenu saat tombol menu ditekan', async () => {
		const onmenu = vi.fn();
		render(NavbarComponent, { props: { onmenu } });
		await userEvent.click(screen.getByRole('button', { name: 'Buka menu' }));
		expect(onmenu).toHaveBeenCalledOnce();
	});

	it('logout setelah dikonfirmasi', async () => {
		render(NavbarComponent, { props: { onmenu: vi.fn() } });
		await userEvent.click(screen.getByRole('button', { name: /keluar/i }));
		await waitFor(() => expect(authApi.logout).toHaveBeenCalled());
	});

	it('tidak logout bila dibatalkan', async () => {
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never);
		render(NavbarComponent, { props: { onmenu: vi.fn() } });
		await userEvent.click(screen.getByRole('button', { name: /keluar/i }));
		await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
		expect(authApi.logout).not.toHaveBeenCalled();
	});
});
