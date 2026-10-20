import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SidebarComponent from './SidebarComponent.svelte';

const mocks = vi.hoisted(() => ({
	page: { url: { pathname: '/' }, params: {} as Record<string, string> }
}));
vi.mock('$app/state', () => ({ page: mocks.page }));

describe('SidebarComponent', () => {
	beforeEach(() => {
		mocks.page.url.pathname = '/';
	});

	it('menampilkan menu utama berlabel Semua Kursus', () => {
		render(SidebarComponent, { props: { open: false, onclose: vi.fn() } });
		expect(screen.getByRole('link', { name: 'Semua Kursus' })).toHaveAttribute('href', '/');
		expect(screen.getByRole('link', { name: 'Daftar Pengguna' })).toHaveAttribute('href', '/users');
		expect(screen.getByRole('link', { name: 'Profil Saya' })).toHaveAttribute('href', '/profile');
	});

	it('menandai menu aktif di beranda', () => {
		render(SidebarComponent, { props: { open: false, onclose: vi.fn() } });
		expect(screen.getByRole('link', { name: 'Semua Kursus' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: 'Profil Saya' })).not.toHaveAttribute('aria-current');
	});

	it('menu Semua Kursus tetap aktif di halaman detail kursus', () => {
		mocks.page.url.pathname = '/courses/3';
		render(SidebarComponent, { props: { open: false, onclose: vi.fn() } });
		expect(screen.getByRole('link', { name: 'Semua Kursus' })).toHaveAttribute('aria-current', 'page');
	});

	it('menandai menu pengguna dan profil', () => {
		mocks.page.url.pathname = '/users';
		const { unmount } = render(SidebarComponent, { props: { open: false, onclose: vi.fn() } });
		expect(screen.getByRole('link', { name: 'Daftar Pengguna' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: 'Semua Kursus' })).not.toHaveAttribute('aria-current');
		unmount();

		mocks.page.url.pathname = '/profile';
		render(SidebarComponent, { props: { open: false, onclose: vi.fn() } });
		expect(screen.getByRole('link', { name: 'Profil Saya' })).toHaveAttribute('aria-current', 'page');
	});

	it('drawer tertutup tanpa overlay', () => {
		const { container } = render(SidebarComponent, { props: { open: false, onclose: vi.fn() } });
		expect(container.querySelector('aside')).toHaveAttribute('data-open', 'false');
		expect(screen.queryByRole('button', { name: 'Tutup menu' })).not.toBeInTheDocument();
	});

	it('drawer terbuka menampilkan overlay yang menutupnya', async () => {
		const onclose = vi.fn();
		const { container } = render(SidebarComponent, { props: { open: true, onclose } });
		expect(container.querySelector('aside')).toHaveAttribute('data-open', 'true');
		await userEvent.click(screen.getByRole('button', { name: 'Tutup menu' }));
		expect(onclose).toHaveBeenCalledOnce();
	});

	it('menutup drawer saat memilih menu', async () => {
		const onclose = vi.fn();
		render(SidebarComponent, { props: { open: true, onclose } });
		await userEvent.click(screen.getByRole('link', { name: 'Profil Saya' }));
		expect(onclose).toHaveBeenCalled();
	});
});
