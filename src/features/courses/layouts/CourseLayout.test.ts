import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { childSnippet } from '../../../test-utils';
import CourseLayout from './CourseLayout.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('$app/state', () => ({ page: { url: { pathname: '/' }, params: {} } }));

describe('CourseLayout', () => {
	it('membungkus navbar, sidebar, dan konten', () => {
		render(CourseLayout, { props: { children: childSnippet() } });
		expect(screen.getByText('Delcom Courses')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Semua Kursus' })).toBeInTheDocument();
		expect(screen.getByText('isi anak')).toBeInTheDocument();
	});

	it('membuka dan menutup sidebar dari navbar', async () => {
		const { container } = render(CourseLayout, { props: { children: childSnippet() } });
		const aside = container.querySelector('aside')!;
		expect(aside).toHaveAttribute('data-open', 'false');
		await userEvent.click(screen.getByRole('button', { name: 'Buka menu' }));
		expect(aside).toHaveAttribute('data-open', 'true');
		await userEvent.click(screen.getByRole('button', { name: 'Tutup menu' }));
		expect(aside).toHaveAttribute('data-open', 'false');
	});
});
