import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { failResponse, okResponse, otherCourse, sampleCourse, sampleUser } from '../../../test-utils';
import { resetUsersStore, usersStore } from '../../users/states/usersStore';
import * as courseApi from '../api/courseApi';
import { coursesStore, resetCoursesStore } from '../states/coursesStore';
import HomePage from './HomePage.svelte';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../api/courseApi');

describe('HomePage', () => {
	beforeEach(() => {
		resetCoursesStore();
		resetUsersStore();
		usersStore.update((state) => ({ ...state, profile: sampleUser }));
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
		vi.mocked(courseApi.getCourses).mockResolvedValue(
			okResponse({ courses: [sampleCourse, otherCourse] })
		);
	});

	it('menampilkan daftar kursus', async () => {
		render(HomePage);
		expect(await screen.findByText('Dasar C')).toBeInTheDocument();
		expect(screen.getByText('Belajar ReactJS')).toBeInTheDocument();
		expect(screen.getByAltText('Sampul Dasar C')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Semua Kursus' })).toBeInTheDocument();
		expect(courseApi.getCourses).toHaveBeenCalledWith(false);
	});

	it('menampilkan status memuat', () => {
		coursesStore.update((state) => ({ ...state, isCourse: true }));
		vi.mocked(courseApi.getCourses).mockReturnValue(new Promise(() => {}));
		render(HomePage);
		expect(screen.getByText('Memuat kursus…')).toBeInTheDocument();
	});

	it('menampilkan keadaan kosong', async () => {
		vi.mocked(courseApi.getCourses).mockResolvedValue(failResponse());
		render(HomePage);
		expect(await screen.findByText('Belum ada kursus yang cocok')).toBeInTheDocument();
	});

	it('mencari berdasarkan judul, deskripsi, atau penulis', async () => {
		render(HomePage);
		await screen.findByText('Dasar C');
		const search = screen.getByLabelText('Cari kursus');
		await userEvent.type(search, 'react');
		expect(screen.queryByText('Dasar C')).not.toBeInTheDocument();
		expect(screen.getByText('Belajar ReactJS')).toBeInTheDocument();
		await userEvent.clear(search);
		await userEvent.type(search, 'pengajar');
		expect(screen.getByText('Belajar ReactJS')).toBeInTheDocument();
		expect(screen.queryByText('Dasar C')).not.toBeInTheDocument();
		await userEvent.clear(search);
		await userEvent.type(search, 'tidak-ada');
		expect(screen.getByText('Belum ada kursus yang cocok')).toBeInTheDocument();
	});

	it('filter milik saya memuat ulang dan menampilkan Hapus Semua', async () => {
		render(HomePage);
		await screen.findByText('Dasar C');
		expect(screen.queryByRole('button', { name: /hapus semua/i })).not.toBeInTheDocument();
		await userEvent.click(screen.getByLabelText('Milik saya'));
		await waitFor(() => expect(courseApi.getCourses).toHaveBeenLastCalledWith(true));
		expect(screen.getByRole('heading', { name: 'Kursus Saya' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /hapus semua/i })).toBeInTheDocument();
	});

	it('tombol Hapus hanya untuk kursus milik pengguna', async () => {
		render(HomePage);
		await screen.findByText('Dasar C');
		expect(screen.getByRole('button', { name: 'Hapus Dasar C' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Hapus Belajar ReactJS' })).not.toBeInTheDocument();
	});

	it('menghapus kursus setelah dikonfirmasi', async () => {
		vi.mocked(courseApi.deleteCourse).mockResolvedValue(okResponse());
		render(HomePage);
		await screen.findByText('Dasar C');
		await userEvent.click(screen.getByRole('button', { name: 'Hapus Dasar C' }));
		await waitFor(() => expect(courseApi.deleteCourse).toHaveBeenCalledWith(3));
		await waitFor(() => expect(courseApi.getCourses).toHaveBeenCalledTimes(2));
	});

	it('tidak menghapus bila dibatalkan', async () => {
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never);
		render(HomePage);
		await screen.findByText('Dasar C');
		await userEvent.click(screen.getByRole('button', { name: 'Hapus Dasar C' }));
		await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
		expect(courseApi.deleteCourse).not.toHaveBeenCalled();
	});

	it('menampilkan error bila hapus gagal', async () => {
		vi.mocked(courseApi.deleteCourse).mockResolvedValue(failResponse('Tidak bisa dihapus'));
		render(HomePage);
		await screen.findByText('Dasar C');
		await userEvent.click(screen.getByRole('button', { name: 'Hapus Dasar C' }));
		await waitFor(() =>
			expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Tidak bisa dihapus' }))
		);
	});

	it('menghapus semua kursus milik saya', async () => {
		vi.mocked(courseApi.deleteAllCourses).mockResolvedValue(okResponse());
		render(HomePage);
		await screen.findByText('Dasar C');
		await userEvent.click(screen.getByLabelText('Milik saya'));
		await userEvent.click(await screen.findByRole('button', { name: /hapus semua/i }));
		await waitFor(() => expect(courseApi.deleteAllCourses).toHaveBeenCalled());
	});

	it('tidak menghapus semua bila dibatalkan', async () => {
		render(HomePage);
		await screen.findByText('Dasar C');
		await userEvent.click(screen.getByLabelText('Milik saya'));
		const button = await screen.findByRole('button', { name: /hapus semua/i });
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never);
		await userEvent.click(button);
		await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
		expect(courseApi.deleteAllCourses).not.toHaveBeenCalled();
	});

	it('membuka modal tambah kursus', async () => {
		render(HomePage);
		await screen.findByText('Dasar C');
		await userEvent.click(screen.getByRole('button', { name: /tambah kursus/i }));
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});
});
