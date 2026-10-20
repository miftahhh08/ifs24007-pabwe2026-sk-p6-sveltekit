import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	apiRequest,
	buildUrl,
	getAccessToken,
	getBaseUrl,
	getErrorMessage,
	isSuccess,
	putAccessToken
} from './apiHelper';

const BASE = 'https://api.test/api/v1';

const mockFetch = (payload: unknown) => {
	const fetchMock = vi.fn().mockResolvedValue({ json: async () => payload });
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
};

describe('apiHelper', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.stubEnv('VITE_DELCOM_BASEURL', BASE);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	it('membaca base url dari environment', () => {
		expect(getBaseUrl()).toBe(BASE);
	});

	it('menyimpan, membaca, dan menghapus token', () => {
		expect(getAccessToken()).toBeNull();
		putAccessToken('abc');
		expect(getAccessToken()).toBe('abc');
		putAccessToken(null);
		expect(getAccessToken()).toBeNull();
	});

	it('membangun url tanpa query', () => {
		expect(buildUrl('/courses')).toBe(`${BASE}/courses`);
	});

	it('membangun url dengan query dan melewati nilai kosong', () => {
		const url = buildUrl('/courses', { is_me: 1, a: undefined, b: null, c: '', d: 'x y' });
		expect(url).toBe(`${BASE}/courses?is_me=1&d=x+y`);
	});

	it('mengirim GET dengan header Authorization bila token ada', async () => {
		putAccessToken('abc');
		const fetchMock = mockFetch({ status: 'success', message: 'ok' });
		const result = await apiRequest('/courses', { query: { is_me: 1 } });
		expect(fetchMock).toHaveBeenCalledWith(`${BASE}/courses?is_me=1`, {
			method: 'GET',
			headers: { Accept: 'application/json', Authorization: 'Bearer abc' },
			body: undefined
		});
		expect(result).toEqual({ status: 'success', message: 'ok' });
	});

	it('mengirim GET tanpa Authorization bila token tidak ada', async () => {
		const fetchMock = mockFetch({ status: 'success', message: 'ok' });
		await apiRequest('/courses');
		expect(fetchMock.mock.calls[0][1].headers).toEqual({ Accept: 'application/json' });
	});

	it('mengirim body JSON dan melewati token bila auth=false', async () => {
		putAccessToken('abc');
		const fetchMock = mockFetch({ status: 'success', message: 'ok' });
		await apiRequest('/auth/login', { method: 'POST', body: { a: 1 }, auth: false });
		expect(fetchMock).toHaveBeenCalledWith(`${BASE}/auth/login`, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify({ a: 1 })
		});
	});

	it('mengirim FormData tanpa Content-Type manual', async () => {
		const fetchMock = mockFetch({ status: 'success', message: 'ok' });
		const formData = new FormData();
		formData.append('cover', new File(['x'], 'c.png', { type: 'image/png' }));
		await apiRequest('/courses/1/cover', { method: 'POST', formData });
		const init = fetchMock.mock.calls[0][1];
		expect(init.body).toBe(formData);
		expect(init.headers).toEqual({ Accept: 'application/json' });
	});

	it('mengembalikan status error saat jaringan gagal', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
		const result = await apiRequest('/courses');
		expect(result.status).toBe('error');
		expect(result.message).toMatch(/tidak dapat terhubung/i);
	});

	it('isSuccess hanya true untuk status success', () => {
		expect(isSuccess({ status: 'success', message: '' })).toBe(true);
		expect(isSuccess({ status: 'fail', message: '' })).toBe(false);
	});

	it('getErrorMessage memakai pesan validasi bila tersedia', () => {
		expect(
			getErrorMessage({ status: 'fail', message: 'Data tidak valid', data: { title: ['Judul wajib', 'Terlalu pendek'] } })
		).toBe('Judul wajib\nTerlalu pendek');
	});

	it('getErrorMessage jatuh ke message bila tidak ada detail', () => {
		expect(getErrorMessage({ status: 'fail', message: 'Gagal' })).toBe('Gagal');
		expect(getErrorMessage({ status: 'fail', message: 'Gagal', data: {} })).toBe('Gagal');
	});
});
