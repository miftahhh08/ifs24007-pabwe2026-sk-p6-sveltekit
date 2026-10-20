import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { childSnippet } from '../../../test-utils';
import AuthLayout from './AuthLayout.svelte';

describe('AuthLayout', () => {
	it('menampilkan identitas aplikasi, teks pengenal kursus, dan children', () => {
		render(AuthLayout, { props: { children: childSnippet() } });
		expect(screen.getAllByText('Delcom Courses').length).toBeGreaterThan(0);
		expect(screen.getByText(/kursus video yang bisa kamu ikuti/i)).toBeInTheDocument();
		expect(screen.getByText(/materi berupa tautan video youtube/i)).toBeInTheDocument();
		expect(screen.getByText('isi anak')).toBeInTheDocument();
	});
});
