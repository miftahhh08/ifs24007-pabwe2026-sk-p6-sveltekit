import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../helpers/apiHelper';
import { login, logout, register } from './authApi';

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('authApi', () => {
	beforeEach(() => {
		vi.mocked(apiRequest).mockResolvedValue({ status: 'success', message: 'ok' });
	});

	it('login memanggil POST /auth/login tanpa token', async () => {
		await login('a@b.c', 'rahasia');
		expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
			method: 'POST',
			body: { email: 'a@b.c', password: 'rahasia' },
			auth: false
		});
	});

	it('register memanggil POST /auth/register tanpa token', async () => {
		await register('Nama', 'a@b.c', 'rahasia');
		expect(apiRequest).toHaveBeenCalledWith('/auth/register', {
			method: 'POST',
			body: { name: 'Nama', email: 'a@b.c', password: 'rahasia' },
			auth: false
		});
	});

	it('logout memanggil POST /auth/logout', async () => {
		await logout();
		expect(apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
	});
});
