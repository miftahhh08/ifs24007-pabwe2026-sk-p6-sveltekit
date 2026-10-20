import Swal from 'sweetalert2';
import { getBaseUrl, getErrorMessage, isSuccess, type ApiResponse } from './apiHelper';

const CONFIRM_COLOR = '#10233f';

export const showSuccessDialog = (message: string) =>
	Swal.fire({ icon: 'success', title: 'Berhasil', text: message, confirmButtonColor: CONFIRM_COLOR });

export const showErrorDialog = (message: string) =>
	Swal.fire({ icon: 'error', title: 'Gagal', text: message, confirmButtonColor: CONFIRM_COLOR });

export async function showConfirmDialog(
	title: string,
	text: string,
	confirmText = 'Ya'
): Promise<boolean> {
	const result = await Swal.fire({
		icon: 'warning',
		title,
		text,
		showCancelButton: true,
		confirmButtonText: confirmText,
		cancelButtonText: 'Batal',
		confirmButtonColor: '#dc2626'
	});
	return result.isConfirmed;
}

/** Tampilkan dialog sukses/gagal sesuai respons, lalu jalankan callback bila sukses. */
export async function notifyResult(
	response: ApiResponse<unknown>,
	onSuccess?: () => void | Promise<void>
): Promise<boolean> {
	if (isSuccess(response)) {
		await showSuccessDialog(response.message);
		await onSuccess?.();
		return true;
	}
	await showErrorDialog(getErrorMessage(response));
	return false;
}

export const formatDate = (value: string): string =>
	new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatRating = (value: string | null | undefined): string =>
	value ? Number(value).toFixed(1) : '-';

/** Ubah path relatif dari API (mis. `img/profile/1.png`) menjadi URL absolut. */
export function resolveAssetUrl(
	path: string | null | undefined,
	fallback = 'default/img/user.png'
): string {
	const target = path || fallback;
	if (/^https?:\/\//.test(target)) return target;
	return `${new URL(getBaseUrl()).origin}/${target.replace(/^\//, '')}`;
}

/** Ambil id video dari tautan YouTube dan kembalikan URL embed, atau null bila tidak valid. */
export function getYoutubeEmbedUrl(url: string): string | null {
	const match = url.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/
	);
	return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
