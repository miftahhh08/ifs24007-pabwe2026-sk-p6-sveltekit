import Swal from 'sweetalert2';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	formatDate,
	formatRating,
	getYoutubeEmbedUrl,
	notifyResult,
	resolveAssetUrl,
	showConfirmDialog,
	showErrorDialog,
	showSuccessDialog
} from './toolsHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

describe('toolsHelper', () => {
	beforeEach(() => {
		vi.stubEnv('VITE_DELCOM_BASEURL', 'https://api.test/api/v1');
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('menampilkan dialog sukses', async () => {
		await showSuccessDialog('Tersimpan');
		expect(Swal.fire).toHaveBeenCalledWith(
			expect.objectContaining({ icon: 'success', text: 'Tersimpan' })
		);
	});

	it('menampilkan dialog error', async () => {
		await showErrorDialog('Gagal');
		expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Gagal' }));
	});

	it('dialog konfirmasi mengembalikan pilihan pengguna', async () => {
		expect(await showConfirmDialog('Hapus?', 'Yakin?')).toBe(true);
		expect(Swal.fire).toHaveBeenLastCalledWith(
			expect.objectContaining({ confirmButtonText: 'Ya', showCancelButton: true })
		);
		vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never);
		expect(await showConfirmDialog('Hapus?', 'Yakin?', 'Hapus')).toBe(false);
		expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ confirmButtonText: 'Hapus' }));
	});

	it('notifyResult menjalankan callback saat sukses', async () => {
		const onSuccess = vi.fn();
		expect(await notifyResult({ status: 'success', message: 'OK' }, onSuccess)).toBe(true);
		expect(onSuccess).toHaveBeenCalledOnce();
	});

	it('notifyResult sukses tanpa callback', async () => {
		expect(await notifyResult({ status: 'success', message: 'OK' })).toBe(true);
	});

	it('notifyResult menampilkan error saat gagal', async () => {
		const onSuccess = vi.fn();
		expect(await notifyResult({ status: 'fail', message: 'Buruk' }, onSuccess)).toBe(false);
		expect(onSuccess).not.toHaveBeenCalled();
		expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: 'error', text: 'Buruk' }));
	});

	it('memformat tanggal dan rating', () => {
		expect(formatDate('2026-01-05T00:00:00.000000Z')).toContain('2026');
		expect(formatRating(null)).toBe('-');
		expect(formatRating(undefined)).toBe('-');
		expect(formatRating('4.0000')).toBe('4.0');
	});

	it('resolveAssetUrl menangani url absolut, relatif, dan fallback', () => {
		expect(resolveAssetUrl('https://img.test/a.png')).toBe('https://img.test/a.png');
		expect(resolveAssetUrl('img/profile/1.png')).toBe('https://api.test/img/profile/1.png');
		expect(resolveAssetUrl('/img/profile/1.png')).toBe('https://api.test/img/profile/1.png');
		expect(resolveAssetUrl(null)).toBe('https://api.test/default/img/user.png');
		expect(resolveAssetUrl(undefined, 'x/y.png')).toBe('https://api.test/x/y.png');
	});

	it('getYoutubeEmbedUrl mengenali berbagai format tautan', () => {
		const embed = 'https://www.youtube.com/embed/uHyfQV0kbgo';
		expect(getYoutubeEmbedUrl('https://youtu.be/uHyfQV0kbgo')).toBe(embed);
		expect(getYoutubeEmbedUrl('https://www.youtube.com/watch?v=uHyfQV0kbgo')).toBe(embed);
		expect(getYoutubeEmbedUrl('https://www.youtube.com/watch?feature=x&v=uHyfQV0kbgo')).toBe(embed);
		expect(getYoutubeEmbedUrl('https://www.youtube.com/embed/uHyfQV0kbgo')).toBe(embed);
		expect(getYoutubeEmbedUrl('https://www.youtube.com/shorts/uHyfQV0kbgo')).toBe(embed);
		expect(getYoutubeEmbedUrl('https://contoh.com/video')).toBeNull();
	});
});
