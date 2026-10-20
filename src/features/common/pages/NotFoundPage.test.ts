import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import NotFoundPage from './NotFoundPage.svelte';

describe('NotFoundPage', () => {
	it('menampilkan pesan 404 dan tautan kembali', () => {
		render(NotFoundPage);
		expect(screen.getByText('404')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Kembali ke Semua Kursus' })).toHaveAttribute('href', '/');
	});
});
