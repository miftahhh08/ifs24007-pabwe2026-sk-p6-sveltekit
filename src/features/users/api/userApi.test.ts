import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../helpers/apiHelper';
import { getProfile, getUsers, postPhoto, putPassword, putProfile } from './userApi';

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('userApi', () => {
	beforeEach(() => {
		vi.mocked(apiRequest).mockResolvedValue({ status: 'success', message: 'ok' });
	});

	it('getUsers memanggil GET /users', async () => {
		await getUsers();
		expect(apiRequest).toHaveBeenCalledWith('/users');
	});

	it('getProfile memanggil GET /users/me', async () => {
		await getProfile();
		expect(apiRequest).toHaveBeenCalledWith('/users/me');
	});

	it('putProfile memanggil PUT /users/me', async () => {
		await putProfile('Nama', 'a@b.c');
		expect(apiRequest).toHaveBeenCalledWith('/users/me', {
			method: 'PUT',
			body: { name: 'Nama', email: 'a@b.c' }
		});
	});

	it('postPhoto mengirim FormData berisi photo', async () => {
		const file = new File(['x'], 'p.png', { type: 'image/png' });
		await postPhoto(file);
		const [path, options] = vi.mocked(apiRequest).mock.calls[0];
		expect(path).toBe('/users/me/photo');
		expect(options?.method).toBe('POST');
		expect(options?.formData?.get('photo')).toBe(file);
	});

	it('putPassword mengirim konfirmasi kata sandi', async () => {
		await putPassword('lama', 'baru', 'baru');
		expect(apiRequest).toHaveBeenCalledWith('/users/password', {
			method: 'PUT',
			body: { password: 'lama', new_password: 'baru', new_password_confirmation: 'baru' }
		});
	});
});
